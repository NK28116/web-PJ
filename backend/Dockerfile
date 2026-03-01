FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/seed ./cmd/seed

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/seed .
COPY --from=builder /build/migrations ./migrations
EXPOSE 8080
CMD ["./server"]
