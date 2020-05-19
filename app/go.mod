module github.com/adrianlzt/piclimbing/backend

go 1.14

require (
	github.com/99designs/gqlgen v0.11.3
	github.com/cdreier/golang-snippets v0.0.0-20190521112639-8280380daefe
	github.com/cpuguy83/go-md2man/v2 v2.0.0 // indirect
	github.com/davidrjenni/reftools v0.0.0-20191222082827-65925cf01315 // indirect
	github.com/go-chi/chi v3.3.2+incompatible
	github.com/go-chi/cors v1.1.1 // indirect
	github.com/go-logr/logr v0.1.0
	github.com/gobwas/httphead v0.0.0-20180130184737-2c6c146eadee // indirect
	github.com/gobwas/pool v0.2.0 // indirect
	github.com/gobwas/ws v1.0.3 // indirect
	github.com/gorilla/websocket v1.4.2
	github.com/gvalkov/golang-evdev v0.0.0-20191114124502-287e62b94bcb
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/influxdata/influxdb1-client v0.0.0-20191209144304-8bf82d3c094d // indirect
	github.com/markbates/pkger v0.15.1
	github.com/matryer/moq v0.0.0-20200310130814-7721994d1b54 // indirect
	github.com/mitchellh/mapstructure v1.3.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/prometheus/client_golang v1.6.0 // indirect
	github.com/prometheus/common v0.9.1 // indirect
	github.com/rs/cors v1.6.0
	github.com/stretchr/testify v1.5.1
	github.com/toqueteos/webbrowser v1.2.0
	github.com/unknwon/bra v0.0.0-20191020212106-9f09ca301444 // indirect
	github.com/urfave/cli/v2 v2.2.0 // indirect
	github.com/vektah/dataloaden v0.3.0 // indirect
	github.com/vektah/gqlparser/v2 v2.0.1
	go.etcd.io/bbolt v1.3.4 // indirect
	golang.org/x/tools v0.0.0-20200502202811-ed308ab3e770 // indirect
	gonum.org/v1/gonum v0.7.0
	gopkg.in/yaml.v2 v2.2.8 // indirect
	k8s.io/klog v1.0.0
)

// https://github.com/99designs/gqlgen/issues/1179
replace github.com/99designs/gqlgen => github.com/adrianlzt/gqlgen v0.11.3-1
