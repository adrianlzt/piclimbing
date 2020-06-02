package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"github.com/adrianlzt/piclimbing/backend/graph/generated"
	"github.com/adrianlzt/piclimbing/backend/graph/model"
	"github.com/adrianlzt/piclimbing/backend/speed"
	"github.com/adrianlzt/piclimbing/backend/strength"
)

func (r *mutationResolver) StrengthCommand(ctx context.Context, params *model.StrengthCommand) (*model.CommandResponse, error) {
	// TODO move this commands to functions instead of sending by channels and waiting for the response?
	switch *params.Command {
	case model.StrengthCommandTypeRestart:
		r.StrengthControlCh <- strength.Control{
			Type: strength.StrengthCommandRestart,
		}
	case model.StrengthCommandTypeRestartNonStop:
		r.StrengthControlCh <- strength.Control{
			Type: strength.StrengthCommandRestartNonStop,
		}
	case model.StrengthCommandTypePause:
		r.StrengthControlCh <- strength.Control{
			Type: strength.StrengthCommandPause,
		}
	case model.StrengthCommandTypeTare:
		r.StrengthControlCh <- strength.Control{
			Type: strength.StrengthCommandTare,
		}
	case model.StrengthCommandTypeCalibrate:
		r.StrengthControlCh <- strength.Control{
			Type:  strength.StrengthCommandCalibrate,
			Value: *params.Value,
		}
	case model.StrengthCommandTypeSimulate:
		r.StrengthControlCh <- strength.Control{
			Type: strength.StrengthCommandSimulate,
		}
	default:
		r.Log.Error(fmt.Errorf("Unkown value"), "Strength command handler", "cmd", *params.Command)
	}

	// Get response or send error
	msg := ""
	var err error
	select {
	case v := <-r.StrengthMsgCh:
		msg = v.Value
	case <-time.NewTimer(1 * time.Second).C:
		err = fmt.Errorf("Timeout waiting for command response")
	}
	return &model.CommandResponse{Message: &msg}, err
}

func (r *mutationResolver) SpeedCommand(ctx context.Context, params *model.SpeedCommand) (*model.CommandResponse, error) {
	switch *params.Command {
	case model.SpeedCommandTypeRestart:
		r.SpeedControlCh <- speed.Control{
			Type: speed.SpeedCommandRestart,
		}
	case model.SpeedCommandTypePause:
		r.SpeedControlCh <- speed.Control{
			Type: speed.SpeedCommandPause,
		}
	case model.SpeedCommandTypeReset:
		r.SpeedControlCh <- speed.Control{
			Type: speed.SpeedCommandReset,
		}
	case model.SpeedCommandTypeCalibrate:
		r.SpeedControlCh <- speed.Control{
			Type:  speed.SpeedCommandCalibrate,
			Value: *params.Value,
		}
	case model.SpeedCommandTypeSimulate:
		r.SpeedControlCh <- speed.Control{
			Type: speed.SpeedCommandSimulate,
		}
	}

	// Get response or send error
	msg := ""
	var err error
	select {
	case v := <-r.SpeedMsgCh:
		msg = v.Value
	case <-time.NewTimer(1 * time.Second).C:
		err = fmt.Errorf("Timeout waiting for command response")
	}
	return &model.CommandResponse{Message: &msg}, err
}

func (r *subscriptionResolver) Speed(ctx context.Context) (<-chan *model.Speed, error) {
	r.Log.V(2).Info("sub speed")

	// TODO size?
	ch := make(chan *model.Speed)

	go func() {
		for {
			select {
			case v := <-r.SpeedDataCh:
				s := model.Speed{
					ID:        v.Id,
					Position:  v.Position,
					Speed:     v.Speed,
					PullUps:   v.PullUps,
					SpeedLoss: v.SpeedLoss,
					LastSpeed: v.LastSpeed,
					MaxSpeed:  v.MaxSpeed,
				}
				ch <- &s
			case <-ctx.Done():
				r.Log.V(3).Info("client exited")
				return
			}
		}
	}()

	return ch, nil
}

func (r *subscriptionResolver) Strength(ctx context.Context) (<-chan *model.Strength, error) {
	r.Log.V(2).Info("sub strength")

	// TODO size?
	ch := make(chan *model.Strength)

	go func() {
		for {
			select {
			case v := <-r.StrengthDataCh:
				s := model.Strength{
					Time:         v.Time,
					Strength:     v.Strength,
					MaxStrength:  v.MaxStrength,
					AvgStrength:  v.AvgStrength,
					Rfd:          v.RFD,
					Fti:          v.FTI,
					StrengthLoss: v.StrengthLoss,
					DutyCycle:    nil,
					Interval:     nil, // TODO fill
				}
				ch <- &s
			case <-ctx.Done():
				r.Log.V(3).Info("client exited")
				return
			}
		}
	}()

	return ch, nil
}

func (r *subscriptionResolver) Coach(ctx context.Context) (<-chan *model.Coach, error) {
	ch := make(chan *model.Coach)

	go func() {
		for {
			text := "foo"
			status := model.CoachStatusReady

			msg := model.Coach{
				Message: &text,
				Status:  &status,
			}
			ch <- &msg
			time.Sleep(1 * time.Second)
		}
	}()

	return ch, nil
}

func (r *subscriptionResolver) StrengthBackendCommands(ctx context.Context) (<-chan *model.StrengthCommandBackend, error) {
	r.Log.V(2).Info("sub strength backend commands")

	// TODO size?
	ch := make(chan *model.StrengthCommandBackend)

	go func() {
		for {
			select {
			case v := <-r.StrengthBackendCmd:
				c := model.StrengthCommandBackendType(*v.Command)
				s := model.StrengthCommandBackend{
					Command: &c,
					Value:   v.Value,
				}
				ch <- &s
			case <-ctx.Done():
				r.Log.V(3).Info("client exited", "function", "StrengthBackendCommands")
				return
			}
		}
	}()

	return ch, nil
}

func (r *subscriptionResolver) SpeedBackendCommands(ctx context.Context) (<-chan *model.SpeedCommandBackend, error) {
	r.Log.V(2).Info("sub speed backend commands")

	// TODO size?
	ch := make(chan *model.SpeedCommandBackend)

	go func() {
		for {
			select {
			case v := <-r.SpeedBackendCmd:
				c := model.SpeedCommandBackendType(*v.Command)
				s := model.SpeedCommandBackend{
					Command: &c,
					Value:   v.Value,
				}
				ch <- &s
			case <-ctx.Done():
				r.Log.V(3).Info("client exited", "function", "SpeedBackendCommands")
				return
			}
		}
	}()

	return ch, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
