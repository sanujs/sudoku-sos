FROM rust:1.83 AS builder
WORKDIR /usr/src
COPY . .
RUN cargo install --path .

FROM debian:bookworm-slim
EXPOSE 8080
RUN apt-get update && apt-get install && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/sudoku-sos /usr/local/bin/sudoku-sos
CMD ["sudoku-sos"]
