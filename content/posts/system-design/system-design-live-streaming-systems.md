---
title: "System Design: The Architecture of Live Streaming"
date: "2024-07-30"
description: "An exploration of live streaming architecture, contrasting it with on-demand video and detailing the protocols and challenges of low-latency delivery, like WebRTC and LL-HLS."
tags: ["System Design", "Live Streaming", "WebRTC", "HLS", "DASH", "Media"]
---

Live streaming powers some of the most engaging experiences on the internet, from Twitch gaming sessions and YouTube Live events to real-time video conferencing on Zoom. Unlike video-on-demand (VOD), where content is pre-recorded and processed, live streaming involves capturing, processing, and delivering video to a global audience in near real-time.

This requirement for low latency introduces a unique set of architectural challenges. While the overall pipeline looks similar to VOD (ingestion, processing, delivery), each step must be optimized for speed. This article dives into the architecture of live streaming systems and explores the protocols that make low-latency delivery possible.

### VOD vs. Live Streaming: The Key Difference is Latency

The fundamental difference between on-demand and live streaming is the tolerance for delay.

*   **Video-on-Demand (VOD)**: Latency is not a major concern. The system can take several minutes or even hours to transcode a video into multiple quality levels. The focus is on quality and cost-efficiency.
*   **Live Streaming**: Latency is everything. The "glass-to-glass" delay—the time from when an event is captured by a camera to when it's seen by a viewer—is the most critical metric.
    *   **Broadcast TV Latency**: ~5-10 seconds.
    *   **Standard HTTP Live Streaming (HLS/DASH)**: 15-45 seconds.
    *   **Low-Latency Streaming**: 2-5 seconds.
    *   **Real-Time Streaming**: < 1 second (for video conferencing).

### The Live Streaming Pipeline

The architecture mirrors the VOD pipeline but with real-time components at each stage.

```mermaid
graph TD
    subgraph Streamer
        Camera[Camera/Software<br/>(e.g., OBS)] -- "1. RTMP" --> IngestServer[Ingest Server]
    end

    subgraph Backend Pipeline
        direction LR
        subgraph Processing
            Transcoder[2. Real-Time Transcoder]
        end

        subgraph Packaging & Delivery
            Packager[3. Packager & Origin Server]
            CDN[4. Content Delivery Network]
        end
    end

    subgraph Viewers
        Player[Video Player]
    end

    IngestServer --> Transcoder
    Transcoder --> Packager
    Packager -- "Origin" --> CDN
    Player -- "Requests segments" --> CDN
```

#### 1. Ingestion: Capturing the Stream

The process starts with the streamer's device (a computer running software like OBS or a mobile phone).
*   **Protocol**: The streamer sends their video feed to the streaming service's **Ingest Server** using a specialized ingestion protocol. The most common is **RTMP (Real-Time Messaging Protocol)**. RTMP is designed for stable, low-latency transmission from one point to another. Newer protocols like SRT (Secure Reliable Transport) are also gaining popularity.
*   **Ingest Server**: This is a globally distributed fleet of servers that act as the entry point. A streamer in Europe will connect to a European ingest server to minimize the initial network latency.

#### 2. Processing: Real-Time Transcoding

Just like VOD, the single high-bitrate stream from the creator must be transcoded into multiple adaptive bitrate (ABR) renditions (1080p, 720p, etc.). However, this must happen *as the video is being received*.

*   **Real-Time Transcoder**: This is a powerful server that performs transcoding on the fly. It cannot process the whole file at once because the file doesn't exist yet—it's a continuous stream.
*   The transcoder processes the incoming RTMP stream segment by segment, creating ABR renditions for each small chunk of video in parallel. This is a computationally intensive and time-sensitive operation.

#### 3. Packaging and Delivery

Once the ABR renditions are created, they need to be packaged into a format that clients can consume.

*   **Packager**: This component takes the transcoded segments and packages them into a streaming protocol like HLS, DASH, or WebRTC.
    *   For HLS/DASH, it creates the media chunks (`.ts` or `.m4s` files) and constantly updates the manifest file (`.m3u8` or `.mpd`) with newly available segments.
*   **Origin Server**: The packager makes these files available on an origin server.
*   **CDN**: A CDN pulls the manifest and video segments from the origin and distributes them globally. Viewers connect to the nearest CDN edge server to download the stream.

### The Challenge of Latency: Protocols Matter

Standard HLS and DASH were designed for reliability, not speed. They introduce significant latency due to their design:
1.  A typical HLS segment duration is 6-10 seconds.
2.  A player must download at least 2-3 segments before starting playback to ensure a stable buffer.
3.  This alone creates a built-in latency of 18-30 seconds.

To combat this, newer protocols and standards have emerged.

#### Low-Latency HLS (LL-HLS) and DASH

These are extensions to the standard protocols that reduce latency to the 2-5 second range. They achieve this through several optimizations:
*   **Shorter Segments**: They use much shorter segment durations, often 1-2 seconds.
*   **Chunked Transfer**: They allow a segment to be broken down into even smaller "chunks." This means the packager can make a part of a segment available *before* the full segment is even finished encoding. The player can then download and start processing this partial segment, shaving off critical seconds.
*   **Manifest Updates**: The server can signal the upcoming availability of a new segment in the manifest before it's fully ready.

#### WebRTC: The Real-Time Champion

For use cases requiring sub-second latency (like video conferencing or online gambling), **WebRTC (Web Real-Time Communication)** is the gold standard.

*   **Peer-to-Peer (P2P)**: WebRTC is designed to establish a direct peer-to-peer connection between browsers, eliminating the need for a central server to relay media.
*   **UDP-Based**: Unlike HLS/DASH which run over TCP, WebRTC uses UDP. TCP guarantees delivery and order, but it will delay everything to retransmit a lost packet. UDP, on the other hand, just sends the packets. If one is lost, it's simply dropped, which is acceptable for video (resulting in a momentary glitch rather than a long pause).
*   **Complex Infrastructure**: While it enables low latency, a large-scale WebRTC broadcast (one-to-many) is complex. It requires a central server (a Selective Forwarding Unit or SFU) to manage the connections and route the video streams efficiently, as a single browser cannot upload its stream to thousands of peers directly.

**Protocol Comparison:**

| Protocol | Typical Latency | Primary Use Case | Mechanism |
| :--- | :--- | :--- | :--- |
| **Standard HLS/DASH** | 15-45 seconds | VOD, non-interactive live events | TCP, long segments |
| **Low-Latency HLS/DASH**| 2-5 seconds | Live sports, news broadcasts | TCP, short/chunked segments |
| **WebRTC** | < 1 second | Video conferencing, interactive events | UDP, peer-to-peer (managed by SFU) |

### Go Example: A Simple RTMP Ingest Server

This conceptual example shows how you might set up a server to accept an RTMP stream using a Go library. This server would be the first entry point for a streamer's broadcast.

```go
package main

import (
    "fmt"
    "log"

    "github.com/gwuhaolin/livego/protocol/rtmp"
    "github.com/gwuhaolin/livego/protocol/rtmp/rtmpcore"
)

// StreamHandler is a custom handler that gets invoked for different RTMP events.
type StreamHandler struct{}

// OnPublish is called when a client starts publishing a stream.
func (h *StreamHandler) OnPublish(conn rtmpcore.Conn) error {
    streamName, _ := conn.StreamName()
    log.Printf("Stream published: %s", streamName)
    
    // In a real system, you would now:
    // 1. Authenticate the stream key.
    // 2. Forward this raw RTMP stream to the real-time transcoding service.
    
    return nil
}

// OnPlay is called when a client wants to play a stream.
// (This is for RTMP playback, not HLS/DASH).
func (h *StreamHandler) OnPlay(conn rtmpcore.Conn) error {
    streamName, _ := conn.StreamName()
    log.Printf("Client playing stream: %s", streamName)
    return nil
}

// OnClose is called when a connection is closed.
func (h *StreamHandler) OnClose(conn rtmpcore.Conn) error {
    streamName, _ := conn.StreamName()
    log.Printf("Stream closed: %s", streamName)
    return nil
}


func main() {
    // Create a new RTMP server
    server := rtmp.NewRtmpServer(&StreamHandler{}, nil)
    
    // The address to listen on
    listenAddr := ":1935"
    log.Printf("RTMP Ingest Server listening on %s", listenAddr)

    // To test this, you can use software like OBS to stream to:
    // rtmp://localhost:1935/live/mystream
    err := server.ListenAndServe(listenAddr)
    if err != nil {
        log.Fatalf("Failed to start RTMP server: %v", err)
    }
}
```
*(To run this, you'll need the `livego` library and its dependencies: `go get github.com/gwuhaolin/livego`)*

### Conclusion

Live streaming architecture is a fascinating optimization problem centered on minimizing latency. While it shares components with VOD, every step must be designed for speed and real-time processing. The choice of streaming protocol is the most critical decision and depends entirely on the latency requirements of the application. For large-scale broadcasts where a few seconds of delay is acceptable, **Low-Latency HLS/DASH** provides a scalable, CDN-friendly solution. For truly interactive, sub-second experiences like video conferencing, **WebRTC** is the undisputed champion, though it requires a more complex backend infrastructure to manage at scale.