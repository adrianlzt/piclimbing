module github.com/adrianlzt/piclimbing/backend

go 1.14

require (
	github.com/99designs/gqlgen v0.11.3
	github.com/cdreier/golang-snippets v0.0.0-20190521112639-8280380daefe
	github.com/go-chi/chi v3.3.2+incompatible
	github.com/go-chi/cors v1.1.1 // indirect
	github.com/go-logr/logr v0.1.0
	github.com/gorilla/websocket v1.4.2
	github.com/gvalkov/golang-evdev v0.0.0-20191114124502-287e62b94bcb
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/markbates/pkger v0.15.1
	github.com/mitchellh/mapstructure v1.3.0 // indirect
	github.com/rs/cors v1.6.0
	github.com/stretchr/testify v1.5.1
	github.com/toqueteos/webbrowser v1.2.0
	github.com/vektah/gqlparser/v2 v2.0.1
	gonum.org/v1/gonum v0.7.0
	gopkg.in/yaml.v2 v2.3.0 // indirect
	k8s.io/klog v1.0.0
)

// https://github.com/99designs/gqlgen/issues/1179
replace github.com/99designs/gqlgen => github.com/adrianlzt/gqlgen v0.11.3-1
