FROM rust:1.83 AS builder
WORKDIR /usr/src
COPY ./server .
RUN cargo install --path .

FROM debian:bookworm-slim
EXPOSE 80
RUN apt-get update && apt-get install && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/sudoku-sos /usr/local/bin/sudoku-sos
CMD ["sudoku-sos"]
