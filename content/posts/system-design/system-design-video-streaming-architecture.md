---
title: "System Design: Architecting a Video Streaming Service"
date: "2024-07-30"
description: "An end-to-end guide to the architecture of video streaming services like Netflix or YouTube, covering ingestion, transcoding, storage, and delivery via CDN."
tags: ["System Design", "Video Streaming", "HLS", "DASH", "CDN", "Media"]
---

Video streaming is one of the most data-intensive and latency-sensitive applications on the internet. Services like YouTube, Netflix, and Twitch serve petabytes of data to millions of users daily, requiring a sophisticated and highly scalable architecture.

Building a video streaming service involves much more than just hosting video files on a server. It's a complex pipeline that includes video ingestion, processing (transcoding), distributed storage, and global delivery. This article provides an end-to-end overview of the architecture behind a modern video-on-demand (VOD) streaming service.

### The End-to-End Video Pipeline

The journey of a video from a creator's camera to a viewer's screen can be broken down into four main stages: **Ingestion**, **Transcoding**, **Storage**, and **Delivery**.

```mermaid
graph TD
    subgraph Creator
        Uploader[Video Upload]
    end

    subgraph Backend Pipeline
        direction LR
        subgraph Ingestion
            UploadService[1. Upload Service]
            RawStorage[(Raw Video Storage<br/>e.g., S3 Bucket)]
        end

        subgraph Processing
            TranscodingQueue[(2. Transcoding Queue<br/>e.g., SQS, RabbitMQ)]
            TranscoderFleet{3. Transcoder Fleet<br/>(EC2, Lambda)}
        end

        subgraph Storage & Delivery
            ProcessedStorage[(4. Processed Video Storage<br/>e.g., S3 Bucket)]
            CDN[5. Content Delivery Network<br/>(e.g., CloudFront, Akamai)]
        end
    end

    subgraph Viewer
        Player[Video Player<br/>(Browser/Mobile App)]
    end

    Uploader --> UploadService
    UploadService --> RawStorage
    UploadService -- "Adds job to queue" --> TranscodingQueue
    TranscoderFleet -- "Pulls job from queue" --> TranscodingQueue
    TranscoderFleet -- "Fetches raw video" --> RawStorage
    TranscoderFleet -- "Saves processed files" --> ProcessedStorage
    ProcessedStorage -- "Origin for" --> CDN
    Player -- "Requests video chunks" --> CDN
```

Let's break down each component.

#### 1. Ingestion: Getting the Video into the System

The first step is for a content creator to upload a high-quality source video file (often called a "mezzanine" file).

*   **Upload Service**: This is a backend service that handles the file upload. For large files, it's crucial not to upload directly to the application server. Instead, a common pattern is to use **presigned URLs**.
    1.  The client asks the Upload Service: "I want to upload a video."
    2.  The service authenticates the user and generates a temporary, secure URL (a presigned URL) that grants write access to a specific location in a cloud storage bucket (like AWS S3).
    3.  The client then uploads the large video file directly to that cloud storage location, bypassing the application server entirely. This prevents the server from becoming a bottleneck.
*   **Raw Video Storage**: The original, high-quality video is stored in a durable and scalable object storage system like Amazon S3 or Google Cloud Storage. This raw file is kept for future re-transcoding if new formats or quality levels are needed.

#### 2. Transcoding: The Most Critical Step

A single high-resolution video file cannot be streamed efficiently to all users. A viewer on a 4K TV has very different needs from someone on a mobile phone with a slow 3G connection. **Transcoding** (or encoding) is the process of converting the raw video into multiple formats and quality levels.

This is where **Adaptive Bitrate Streaming (ABR)** comes into play. The transcoder creates several versions of the same video:
*   **Multiple Resolutions**: 4K (2160p), HD (1080p), 720p, 480p, etc.
*   **Multiple Bitrates**: For each resolution, there might be different bitrates (e.g., a high-quality 1080p and a more compressed 1080p).
*   **Chunking**: Each version of the video is then broken down into small, 2-10 second segments or "chunks" (e.g., `.ts` files).
*   **Manifest File**: The transcoder also generates a **manifest file** (e.g., `.m3u8` for HLS, `.mpd` for DASH). This is a small text file that acts as a playlist, telling the video player what quality levels and chunks are available.

The transcoding process is computationally expensive. This is why it's handled by a dedicated, scalable fleet of servers or serverless functions.
*   **Transcoding Queue**: When the upload is complete, the Upload Service places a job in a message queue (like SQS or RabbitMQ). The job contains information about the location of the raw video file.
*   **Transcoder Fleet**: A fleet of workers (e.g., EC2 instances, Kubernetes pods, or AWS Lambda functions) pulls jobs from this queue. They fetch the raw video, perform the transcoding using tools like **FFmpeg**, and save the resulting chunks and manifest file to the processed storage bucket. This architecture allows you to scale the number of transcoders up or down based on the queue length.

#### 3. Storage: Storing the Processed Files

The output of the transcoding process—thousands of small video chunks and a manifest file for each video—is stored in another object storage bucket. This bucket is configured to be the **origin** for the Content Delivery Network (CDN).

The directory structure for a single video might look like this:
```
/video_123/
  ├── manifest.m3u8
  ├── 1080p/
  │   ├── chunk_001.ts
  │   ├── chunk_002.ts
  │   └── ...
  ├── 720p/
  │   ├── chunk_001.ts
  │   ├── chunk_002.ts
  │   └── ...
  └── 480p/
      ├── chunk_001.ts
      ├── chunk_002.ts
      └── ...
```

#### 4. Delivery: Getting the Video to the Viewer

This is the final and most performance-critical stage. It's handled almost entirely by a **Content Delivery Network (CDN)**. A CDN is a global network of edge servers that cache content closer to users.

**The Streaming Flow:**
1.  A viewer clicks "play" on a video.
2.  The video player first requests the **manifest file** (e.g., `manifest.m3u8`) from the CDN.
3.  The CDN checks if it has a cached copy of the manifest. If not, it fetches it from the origin storage (S3) and caches it for future requests.
4.  The player parses the manifest and learns about the available quality levels. It detects the user's current network speed and screen size.
5.  Based on this, the player decides to start with, for example, the 720p stream. It then requests the first few video chunks from the 720p playlist (e.g., `/720p/chunk_001.ts`, `/720p/chunk_002.ts`).
6.  These chunks are served from the nearest CDN edge server, ensuring low latency.
7.  As the video plays, the player continuously monitors network conditions. If the network gets faster, it might start requesting chunks from the 1080p stream. If it gets slower, it will switch down to the 480p stream. This is **Adaptive Bitrate Streaming** in action.

### Key Streaming Protocols: HLS and DASH

*   **HLS (HTTP Live Streaming)**: Developed by Apple, it's one of the most widely supported protocols. It uses `.m3u8` manifest files and `.ts` video chunks.
*   **DASH (Dynamic Adaptive Streaming over HTTP)**: An international standard. It's similar to HLS but is codec-agnostic and uses an XML-based `.mpd` manifest file.

Both protocols work over standard HTTP, which makes them easy to deliver and cache with standard web servers and CDNs.

### Go Example: A Simple Upload Service

This conceptual Go code shows how an upload service might generate a presigned URL for a client to upload a file directly to S3.

```go
package main

import (
    "log"
    "net/http"
    "time"

    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/s3"
    "github.com/google/uuid"
)

const (
    awsRegion   = "us-east-1"
    bucketName  = "my-raw-videos-bucket"
)

var s3Svc *s3.S3

func init() {
    // Initialize AWS session
    sess, err := session.NewSession(&aws.Config{
        Region: aws.String(awsRegion)},
    )
    if err != nil {
        log.Fatalf("Failed to create AWS session: %v", err)
    }
    s3Svc = s3.New(sess)
}

// getPresignedURLHandler generates a temporary URL for a client to upload a file.
func getPresignedURLHandler(w http.ResponseWriter, r *http.Request) {
    // In a real app, you would authenticate the user here.

    // Generate a unique key (filename) for the video.
    videoID := uuid.New().String()
    objectKey := "raw/" + videoID + ".mp4"

    // Create the request to generate the presigned URL
    req, _ := s3Svc.PutObjectRequest(&s3.PutObjectInput{
        Bucket: aws.String(bucketName),
        Key:    aws.String(objectKey),
    })

    // Generate the URL, which will be valid for 15 minutes
    urlStr, err := req.Presign(15 * time.Minute)
    if err != nil {
        log.Printf("Failed to sign request: %v", err)
        http.Error(w, "Failed to generate upload URL", http.StatusInternalServerError)
        return
    }

    // Return the URL to the client
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(`{"upload_url": "` + urlStr + `", "video_id": "` + videoID + `"}`))
    log.Printf("Generated presigned URL for video ID: %s", videoID)
}

func main() {
    http.HandleFunc("/generate-upload-url", getPresignedURLHandler)

    log.Println("Starting server on :8080")
    // After the client uploads the file, S3 can be configured to send an event
    // to a Lambda function or SQS queue to trigger the transcoding process.
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}
```
*(To run this, you'll need the AWS SDK for Go: `go get github.com/aws/aws-sdk-go`)*

### Conclusion

Architecting a video streaming service is a masterclass in distributed systems design. It requires a clear separation of concerns: an **ingestion pipeline** to handle uploads securely, a massively parallel **transcoding system** to prepare the content, and a global **CDN** to ensure low-latency delivery. By leveraging cloud services like object storage, message queues, and CDNs, and by using standard adaptive bitrate streaming protocols like HLS and DASH, it's possible to build a robust and scalable platform capable of serving high-quality video to a global audience.