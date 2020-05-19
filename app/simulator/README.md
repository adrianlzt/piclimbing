# Device simulator

Using evemu, it is possible to create a virtual device simulating the linear encoder.

It is necessary to have evemu installed in the system.

The python script generates test data as requested and plays it into the device.

The script should run as root.

The used who runs the go app should be in the "input" group.
```
sudo gpasswd -a USER input
```
