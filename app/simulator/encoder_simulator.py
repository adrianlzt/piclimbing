#!/usr/bin/env python
"""
This script writes a file with the events needed to simulate a session of exercise.
After an increase/decrease event a zero event is sent (this is how the sensor behaves).
Should be run as root, it needs to create a /dev/input/ file
"""

import os
import sys
import evemu
import math
import time
import argparse
import tempfile
import logging

FORMAT = "[%(asctime)s %(levelname)s %(filename)s:%(lineno)s - %(funcName)20s() ] %(message)s"
logging.basicConfig(level=logging.WARNING, format=FORMAT)
logger = logging.getLogger(__name__)

# Events generated by the device when is turned CW or CCW
# For our use, is forward (increas) or backwards (decrease)
INCREASE_EVENT = "E: {time:.6f} 0002 0000 0001"
DECREASE_EVENT = "E: {time:.6f} 0002 0000 -001"
ZERO_EVENT = "E: {time:.6f} 0000 0000 0000"

# Distance in meters for each event
TICK_DISTANCE = 0.00179267

# Min speed for events, to avoid large gaps
MIN_SPEED = 0.1

DEVICE_PROPERTIES = b"""N: rotary@4
I: 0019 0000 0000 0000
P: 00 00 00 00 00 00 00 00
B: 00 0b 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 01 00 00 00 00 00 00 00 00
B: 02 01 00 00 00 00 00 00 00
B: 03 00 00 00 00 00 00 00 00
B: 04 00 00 00 00 00 00 00 00
B: 05 00 00 00 00 00 00 00 00
B: 11 00 00 00 00 00 00 00 00
B: 12 00 00 00 00 00 00 00 00
B: 14 00 00 00 00 00 00 00 00
B: 15 00 00 00 00 00 00 00 00
B: 15 00 00 00 00 00 00 00 00
"""


class Main:

    def __init__(self, args=False):
        self.args = args
        self.device = evemu.Device("encoder.props")

        # Sleep 1s to be sure that the go app opens the file device
        time.sleep(1)

    def _get_simulation_data(self):
        """
        Return the string with the contents of the simulated
        data according to the parameters established
        """
        # Add header
        data = [DEVICE_PROPERTIES]

        # Absolute time in seconds
        event_time = 0.000001

        # Move slowly to the start position
        for _ in range(0, int(self.args.min_height / TICK_DISTANCE)):
            data.append(bytes(INCREASE_EVENT.format(time=event_time) + "\n", "UTF-8"))
            data.append(bytes(ZERO_EVENT.format(time=event_time) + "\n", "UTF-8"))
            # Move at 0.1m/s
            event_time += TICK_DISTANCE / 0.1

        for i in range(0, self.args.count):
            # Get the max speed for each serie
            # First serie at max_speed, last serie at max_speed*speed_loss
            speed = self.args.max_speed
            if self.args.count > 1:
                speed = self.args.max_speed * (1 - (self.args.speed_loss/100 * i / (self.args.count - 1)))

            d, event_time = self._get_one_pullup(event_time, speed)
            data.extend(d)

        # Move slowly to the floor
        for _ in range(0, int(self.args.min_height / TICK_DISTANCE)):
            data.append(bytes(DECREASE_EVENT.format(time=event_time) + "\n", "UTF-8"))
            data.append(bytes(ZERO_EVENT.format(time=event_time) + "\n", "UTF-8"))
            # Move at 0.1m/s
            event_time += TICK_DISTANCE / 0.1

        return data

    def _get_one_pullup(self, etime, max_speed):
        """
        Generate the events for one pull according to
        the parameters
        """
        logger.info(f"_get_one_pullup max_speed={max_speed}")

        data = []

        # Complete sin wave simulating the speed of the full pull up.
        # Half wave (from 0 to 0) to go up, and same to go down
        # The number of steps decide how high the pull up goes
        # Get the number of ticks needed to go up and down for the defined distance
        distance_ticks = self.args.distance * 2 / TICK_DISTANCE

        range_max = math.pi*2*1000000
        step_size = range_max / distance_ticks

        speed = [max_speed * math.sin(x/1000000) for x in range(0, int(range_max), int(step_size))]
        logger.info(f"distance: {self.args.distance}  distance_ticks: {distance_ticks}, len(speed): {len(speed)}")

        for s in speed:
            # Set a min speed for events, to avoid long times in the top/bottom
            if s >= 0 and s < MIN_SPEED:
                s = MIN_SPEED
            elif s < 0 and s > -MIN_SPEED:
                s = -MIN_SPEED

            # The space between points determine the speed
            # If speed is positive, the climber is ascending
            if s > 0:
                data.append(bytes(INCREASE_EVENT.format(time=etime) + "\n", "UTF-8"))
            else:
                data.append(bytes(DECREASE_EVENT.format(time=etime) + "\n", "UTF-8"))

            data.append(bytes(ZERO_EVENT.format(time=etime) + "\n", "UTF-8"))

            delta = TICK_DISTANCE / abs(s)
            logger.debug(f"delta: {delta*1000:.1f},  speed: {s:.2f}, increase: {s>0}")
            etime += delta

        return data, etime

    def run(self):
        logger.info(sys._getframe().f_code.co_name)

        simulation_data = self._get_simulation_data()

        if self.args.dry_run:
            for l in simulation_data:
                print(str(l))
            return

        with tempfile.TemporaryFile() as f:
            f.writelines(simulation_data)
            # flush the file so evemu could read the proper data
            f.flush()
            os.fsync(f.fileno())
            f.seek(0)
            self.device.play(f)


def parse_args(argv):
    """
    parse arguments/options

    this uses the new argparse module instead of optparse
    see: <https://docs.python.org/2/library/argparse.html>
    """
    p = argparse.ArgumentParser(description='Linear encoder device simulator', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument('--dry-run', dest='dry_run', action='store_true',
                   default=False, help="dry-run - only output the file to stdout")
    p.add_argument('-v', '--verbose', dest='verbose', action='count', default=0,
                   help='verbose output. specify twice for debug-level output.')
    p.add_argument("-c", "--count", action="store", help="Number of pull ups.", type=int, default=3)
    p.add_argument("-mh", "--min-height", action="store", help="Height at which pullups will be done (meters)", type=float, default=0.9)
    p.add_argument("-d", "--distance", action="store", help="Distance traveled during the pullup (meters)", type=float, default=0.54)
    p.add_argument("-ms", "--max-speed", action="store", help="Speed of the first pull up (m/s)", type=float, default=1.5)
    p.add_argument("-s", "--speed-loss", action="store", help="Speed loos between the first and last pull up (percentage)", type=float, default=20)

    args = p.parse_args(argv)

    return args


if __name__ == "__main__":
    args = parse_args(sys.argv[1:])
    if args.verbose > 1:
        logger.setLevel(logging.DEBUG)
    elif args.verbose > 0:
        logger.setLevel(logging.INFO)
    main = Main(args)
    main.run()