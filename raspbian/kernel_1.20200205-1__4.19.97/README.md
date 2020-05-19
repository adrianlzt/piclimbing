# HX711
These files are used to access the HX711 device from Linux.

``hx711.ko``: kernel module for the hx711, modified to have a faster sampling.
``hx711.c.patch``: modifications made to the driver. I do not have a explanation for this behaviour. I talked with Andreas Klinger, the developer of the driver, but he did not understand neither. More tests are needed to understand why this is happening.

The kernel debug level should be increased to level 5 (by default it is 4) to increse the sampling speed:
```
echo 5 > /proc/sys/kernel/printk
```

``hx711-overlay.dts``: to load external hardware in Raspbian it should be specified in the [Device Tree](https://www.raspberrypi.org/documentation/configuration/device-tree.md). This file load the hx711 device using the specified pins.
``hx711.dtbo``: compiled version of the above file

