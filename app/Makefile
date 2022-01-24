NAME=piclimbing

# TODO build frontend before pkger
all: frontend pkger build_rpizero build_amd64 build_windows_amd64

frontend:
	@echo "build frontend before!"

# Insert the frontend code in pkged.go
pkger:
	pkger

build_rpizero:
	CC=arm-linux-gnueabihf-gcc CGO_ENABLED=1 GOARCH=arm GOARM=6 go build -o ${NAME}.arm6 .

build_amd64:
	go build -o ${NAME} .

build_windows_amd64:
	GOOS=windows GOARCH=amd64 go build -o ${NAME}.exe

build_osx:
	GOOS=darwin go build -o ${NAME}.osx

.PHONY: all build_amd64 build_rpizero build_windows_amd64 pkger frontend


# vim:ft=make
#
