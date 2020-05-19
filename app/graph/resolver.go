package graph

import (
	"github.com/adrianlzt/piclimbing/backend/speed"
	"github.com/adrianlzt/piclimbing/backend/strength"
	"github.com/go-logr/logr"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver is used to inject dependencies in the GraphQL resolvers
type Resolver struct {
	Log                logr.Logger
	StrengthDataCh     <-chan strength.ExportData
	StrengthBackendCmd <-chan strength.BackendCmd
	StrengthControlCh  chan<- strength.Control
	StrengthMsgCh      <-chan strength.ClientMsg
	SpeedDataCh        <-chan speed.ExportData
	SpeedBackendCmd    <-chan speed.BackendCmd
	SpeedControlCh     chan<- speed.Control
	SpeedMsgCh         <-chan speed.ClientMsg
}
