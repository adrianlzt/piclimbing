# πclimbing
Open source climbing assessment tool build on top of Raspberry Pi ZeroW.

[Online demo](http://piclimbing.duckdns.org/)

Climbers/coaches/investigators could use this tool to measure and training.

The tool has two interfaces with the real world: one linear encoder (to measure speed) and on load cell (to measure force).

The linear encoder is used to measure speed while doing pull-ups.

Load cell is used to measure strength in isometric exercises.

TODO: where to download and try. Explain how to use the "Simulation"

TODO: gif with a small demo

TODO: video with the real usage

TODO: photo of the raspi + input devices

## Hardware
The hardware needed to build this tools is:
  * [Raspberry Pi ZeroW](https://www.raspberrypi.org/products/raspberry-pi-zero-w/)
  * Braincoder (DIY linear encoder)
  * KY-040 Rotary Encoder
  * S Type Load Cell, 300kg
  * HX711 analog-to-digital converter

Network schema: TODO

### Raspberry Pi ZeroW
Small computer which could run Linux and have WiFi integrated.

It is used to connect the input devices and run the app that reads from those devices. It also serves the web page used by users.

### S Type Load Cell
This element will be placed between the anchor and our hangboard (or the hold we use) to measure the force.

I bought [this one](https://www.amazon.fr/dp/B077YFF6VQ/ref=pe_3044141_189395771_TE_dp_1) in Amazon.

I guess any brand selling PSD-S1 will work.

I chose 300kg because 100kg is not enough and 2000kg will have a bigger error.

### HX711
This ADC converter looks like is the standar to connect load cells to digital inputs. The signal in the load cell is too small to be readed directly with the Raspberry.

The board should allow a change in the sampling rate (pin RATE, check the [datasheet](https://cdn.sparkfun.com/datasheets/Sensors/ForceFlex/hx711_english.pdf)), to allow 80 samplings per second (80 SPS).

[This one](https://www.sparkfun.com/products/13879) allows it.

I bought [this one](https://www.ebay.es/itm/HX711-Board-Chip-Waage-Gewichts-sensor-Scale-Modul-Arduino-Raspberry-Pi-Gewicht-/252712602933), but I have to modify the board slightly:
![hx711 hack](images/hx711_fix.png)

Connection to the PiZeroW
```
3v3    - Vcc
GPIO17 - DT
GPIO27 - SCK
```

Connection to the load cell:
```
Red   - E+
Black - E-
White - A-
Green - A+
```

### Linear encoder
To build a linear encoder with the rotary encoder KY-040 you could follow the instructions of the [Braincoder](https://www.youtube.com/watch?v=UmpN9vo_ixU).

The pdf with the instructions (in spanish) the the 3d models are in ``hardware/linear_encoder``


## Software

### Raspberry PiZeroW
Raspbian (Debian linux version for Raspberry) should be installed into the PiZeroW and configured to use the input devices.

To read data from the load cell we use the [hx711 linux driver](https://github.com/raspberrypi/linux/blob/rpi-4.19.y/drivers/iio/adc/hx711.c).

The kernel should be compiled with this new module to be available. It have been slightly modified to have a fastest sampling.

See ``raspbian/kernel_1.20200205-1__4.19.97``

To load the KY-040 should be added to the [Device Tree](https://www.raspberrypi.org/documentation/configuration/device-tree.md), adding to ``/boot/config.txt``:
```
# (replacing {CLK_PIN} and {DT_PIN} by their real values)
dtoverlay=rotary-encoder,pin_a={CLK_PIN},pin_b={DT_PIN},relative_axis=1,steps-per-period=2
```

TODO:
 * how to install raspbian with the modified hx711 module and configure the Device Tree for hx711 and KY-040 (/home/adrian/Documentos/raspberry/leeme.txt)
 * how to configure WiFi
 * how to install the backend+frontend

### Backend
The purpouse of the backend is to read from the input devices and present the data with a GraphQL API.

This tool is built using Go.

Code in ``app/``.

It is available to be downloaded in the releases page.

TODO: diagram of the building blocks

### Frontend
Consumes data from the GraphQL API and present the values and graphs to the user.

Built with [Gatsby](https://www.gatsbyjs.org/), [ReactJS](http://reactjs.org/) and [Elastic UI](https://elastic.github.io/eui/#/)

Code in ``app/frontend``.

It is built as a static page and inserted into the backend Go app.

TODO: add some screenshots

## Develop
### Backend
I normally develop in my amd64/linux simulating data using ``app/simulator/encoder_simulator.py`` and ``app/simulator/load_cell_simulator.py``

I have to use a fork of gqlgen because of https://github.com/99designs/gqlgen/issues/1179

```
cd app
bra run
```

### Frontend
```
cd app/frontend
yarn
gatsby develop
```
