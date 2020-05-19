#!/usr/bin/env python
"""
This script writes a file with values simulating a session of exercise.
"""

import os
import sys
import evemu
import random
import math
import time
import argparse
import tempfile
import logging

FORMAT = "[%(asctime)s %(levelname)s %(filename)s:%(lineno)s - %(funcName)20s() ] %(message)s"
logging.basicConfig(level=logging.WARNING, format=FORMAT)
logger = logging.getLogger(__name__)

# Values taken from the go app
LOAD_CELL_CALIBRATION_FACTOR = 0.0000628694
LOAD_CELL_OFFSET = 8386793

class Main:

    def __init__(self, args=False):
        self.args = args

    def _write(self, value):
        """
        Write a new value to the file and seek the file to the beggining,
        Convert the value, in kg, to the number expected in the file.
        for the next write.
        Wait the time between sampling
        """
        raw_value = (value/LOAD_CELL_CALIBRATION_FACTOR) + LOAD_CELL_OFFSET
        if self.args.dry_run:
            print(f"value={value:.2f}  raw_value={raw_value:0f}")
        else:
            self.args.file.write(str(raw_value))
            self.args.file.seek(0)
            time.sleep(self.args.sampling/1000)

    def run(self):
        print(sys._getframe().f_code.co_name)

        # Preparation
        print(f"Preparation. duration={self.args.preparation_time}, force={self.args.preparation_force}, noise={self.args.preparation_force_noise}")
        # Convert time to milliseconds to use integers, needed by "range"
        for i in range(0, int(self.args.preparation_time*1000), self.args.sampling):
            # Generate a value
            value = self.args.preparation_force + (self.args.preparation_force_noise * random.uniform(-1,1))
            self._write(value)

        # Start (reaching the max force)
        print(f"Start. duration={self.args.time_max_force/1000}, min_force={self.args.preparation_force}, max_force={self.args.max_force}")
        for i in range(0, self.args.time_max_force, self.args.sampling):
            # Generate values from the preparation_force to the max_force
            value = self.args.preparation_force + ((self.args.max_force - self.args.preparation_force) * (i+self.args.sampling) / self.args.time_max_force)
            self._write(value)

        # Hang
        duration = self.args.duration*1000 - self.args.time_max_force
        print(f"Hang. duration={duration/1000}, max_force={self.args.max_force}, min_force={self.args.max_force*(1-(self.args.force_loss/100))}")
        for i in range(0, int(duration), self.args.sampling):
            # Generate values from the max_force to max_force*(100-force_loss)
            value = self.args.max_force - (self.args.max_force * (self.args.force_loss/100) * (i+self.args.sampling) / duration) + (self.args.force_noise * random.uniform(-1,1))
            self._write(value)

        # End (realeasing)
        print(f"End. duration={self.args.time_min_force/1000}, max_force={self.args.max_force*(1-(self.args.force_loss/100))}, min_force={self.args.finish_force}")
        for i in range(0, self.args.time_min_force, self.args.sampling):
            # Generate values from max_force*(100-force_loss) to finish_force
            value = self.args.max_force*(1-(self.args.force_loss/100)) - (((self.args.max_force*(1-(self.args.force_loss/100))) + self.args.finish_force) * (i+self.args.sampling) / self.args.time_min_force)
            self._write(value)

        # Finish stage
        print(f"Finish. duration={self.args.finish_time}, force={self.args.finish_force}, noise={self.args.finish_force_noise}")
        for i in range(0, int(self.args.finish_time*1000), self.args.sampling):
            value = self.args.finish_force + (self.args.finish_force_noise * random.uniform(-1,1))
            self._write(value)

def parse_args(argv):
    p = argparse.ArgumentParser(description='Load cell device simulator', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument('--dry-run', dest='dry_run', action='store_true',
                   default=False, help="dry-run - print to stdout")
    p.add_argument('-v', '--verbose', dest='verbose', action='count', default=0,
                   help='verbose output. specify twice for debug-level output.')
    p.add_argument("-f", "--file", action="store", help="File to simulate the device.", type=argparse.FileType('w'), default='load_cell.device')
    p.add_argument("-c", "--count", action="store", help="Number of hangs.", type=int, default=0)
    p.add_argument("-d", "--duration", action="store", help="Duration of the hang (seconds)", type=float, default=10)
    p.add_argument("-mf", "--max-force", action="store", help="Max force (kg)", type=float, default=80)
    p.add_argument("-fl", "--force-loss", action="store", help="Force loos between the start and end of each hang (percentage 0-100)", type=float, default=20)
    p.add_argument("-fn", "--force-noise", action="store", help="Max variation of force while haging (kg)", type=float, default=1)
    p.add_argument("-tM", "--time-max-force", action="store", help="Time spent to reach the max force (ms)", type=int, default=200)
    p.add_argument("-tm", "--time-min-force", action="store", help="Time spent to release the force of the hang (ms)", type=int, default=100)
    p.add_argument("--sampling", action="store", help="Time between new values (ms)", type=int, default=20)
    p.add_argument("-pt", "--preparation-time", action="store", help="Time spent before starting the hang (s)", type=float, default=3)
    p.add_argument("-pf", "--preparation-force", action="store", help="Force done while preparing (kg)", type=float, default=5)
    p.add_argument("-pfn", "--preparation-force-noise", action="store", help="Max variation of force while preparing (kg)", type=float, default=0.2)
    p.add_argument("-ft", "--finish-time", action="store", help="Time spent after ending the hang (s)", type=float, default=3)
    p.add_argument("-ff", "--finish-force", action="store", help="Force done while finishing (kg)", type=float, default=0)
    p.add_argument("-ffn", "--finish-force-noise", action="store", help="Max variation of force while finishing (kg)", type=float, default=0.2)

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
