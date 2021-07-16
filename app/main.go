package main

import (
	"flag"
	"fmt"
	"net/http"
	"runtime"
	"strconv"
	"time"

	"k8s.io/klog"
	"k8s.io/klog/klogr"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/adrianlzt/piclimbing/backend/graph"
	"github.com/adrianlzt/piclimbing/backend/graph/generated"
	"github.com/adrianlzt/piclimbing/backend/speed"
	"github.com/adrianlzt/piclimbing/backend/strength"
	"github.com/cdreier/golang-snippets/snippets"
	"github.com/go-chi/chi"
	"github.com/gorilla/websocket"
	"github.com/markbates/pkger"
	"github.com/rs/cors"
	"github.com/toqueteos/webbrowser"
)

func main() {
	encoderDeviceFile := flag.String("encoder-device", "/dev/input/event0", "Device where encoder is connected")
	strengthDeviceFile := flag.String("strength-device", "/sys/devices/platform/hx711/iio:device0/in_voltage0_raw", "Device where the load cell is connected")
	strengthGatherTime := flag.Float64("strength-gather-time", 20.0, "Wait time, in milliseconds, between gathers, to have a smooth distribution of collected data")
	enableEncoder := flag.Bool("enable-encoder", true, "Enable/disable the encoder part and all the speed measurements")
	enableLoadCell := flag.Bool("enable-load-cell", true, "Enable/disable the load cell part and all the strength measurements")
	port := flag.Int("port", 8080, "HTTP listen port")
	speedSampling := flag.Duration("speed-sampling", 100*time.Millisecond, "How often should be values pushed to the client")
	strengthSampling := flag.Duration("strength-sampling", 100*time.Millisecond, "How often should be values pushed to the client")

	// Logger
	klog.InitFlags(nil)
	flag.Set("stderrthreshold", "INFO")
	// level 5: full debug
	// level 4: captured data, avoiding duplicates
	// level 3: commands and other operations not related with data capture
	// level 2: start of goroutines
	// level 1: ?
	flag.Set("v", "1")
	flag.Parse()

	log := klogr.New()

	// TODO chan size
	// Channel to move data between speed calculator and GraphQL
	speedData := make(chan speed.ExportData, 500)
	speedControl := make(chan speed.Control, 500)
	speedMsg := make(chan speed.ClientMsg, 500)
	// Channel to send commands from this app to the client
	speedBackendCmd := make(chan speed.BackendCmd, 500)

	// TODO chan size
	// Channel to move data between strength calculator and GraphQL
	strengthData := make(chan strength.ExportData, 500)
	strengthControl := make(chan strength.Control, 500)
	strengthMsg := make(chan strength.ClientMsg, 500)
	// Channel to send commands from this app to the client
	strengthBackendCmd := make(chan strength.BackendCmd, 500)

	speed := speed.Speed{
		Log:                   log,
		ClientSampling:        *speedSampling,
		Device:                *encoderDeviceFile,
		ExportChannel:         speedData,
		ControlChannel:        speedControl,
		ClientMessagesChannel: speedMsg,
		BackendCmdChannel:     speedBackendCmd,
	}

	strength := strength.Strength{
		Log:                   log,
		ClientSampling:        *strengthSampling,
		Device:                *strengthDeviceFile,
		GatherTime:            *strengthGatherTime,
		ExportChannel:         strengthData,
		ControlChannel:        strengthControl,
		ClientMessagesChannel: strengthMsg,
		BackendCmdChannel:     strengthBackendCmd,
	}

	resolver := graph.Resolver{
		Log:                log,
		StrengthDataCh:     strengthData,
		StrengthControlCh:  strengthControl,
		StrengthMsgCh:      strengthMsg,
		StrengthBackendCmd: strengthBackendCmd,
		SpeedMsgCh:         speedMsg,
		SpeedControlCh:     speedControl,
		SpeedDataCh:        speedData,
		SpeedBackendCmd:    speedBackendCmd,
	}

	log.V(2).Info("start", "enableEncoder", *enableEncoder, "enableLoadCell", *enableLoadCell)

	if *enableEncoder {
		go speed.RunSpeed()
	}

	if *enableLoadCell {
		go strength.RunStrength()
	}

	// GraphQL
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: &resolver}))
	//srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolver}))

	router := chi.NewRouter()

	// Add CORS middleware around every request
	// See https://github.com/rs/cors for full option listing
	router.Use(cors.New(cors.Options{
		AllowedOrigins: []string{
			// Allow all
			"*",
		},
		AllowCredentials: true,
		Debug:            false,
	}).Handler)

	// If we don't use handler.NewDefaultServer, to be able to set CORS in WS, we have to add all the
	// others Transports
	srv.AddTransport(&transport.Websocket{
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// Check against your desired domains here
				//return r.Host == "localhost"
				// Allow all
				return true
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	})
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})

	srv.SetQueryCache(lru.New(1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(100),
	})

	//router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	distDir := pkger.Dir("/frontend/public")
	snippets.ChiFileServer(router, "/", distDir)

	if runtime.GOOS == "linux" && runtime.GOARCH == "arm" {
		// raspberry
		// TODO detect IP address and use it instead of 127.0.0.1
		fmt.Printf("Go to: http://127.0.0.1.nip.io:%v\n", strconv.Itoa(*port))
	} else {
		fmt.Printf("Go to: http://127.0.0.1.nip.io:%v\n", strconv.Itoa(*port))
		go webbrowser.Open(fmt.Sprintf("http://127.0.0.1.nip.io:%v", strconv.Itoa(*port)))
	}

	err := http.ListenAndServe(":"+strconv.Itoa(*port), router)
	if err != nil {
		panic(err)
	}
}
