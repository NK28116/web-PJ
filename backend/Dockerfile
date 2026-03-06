FROM golang:1.22-alpine AS base
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

FROM base AS builder
COPY . .
RUN go build -o server ./cmd/server
RUN go build -o seed ./cmd/seed
RUN go build -o migrate ./cmd/migrate

FROM alpine:3.19 AS runner
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/server ./server
COPY --from=builder /app/seed ./seed
COPY --from=builder /app/migrate ./migrate
COPY --from=builder /app/migrations ./migrations
EXPOSE 8080
CMD ["./server"]
