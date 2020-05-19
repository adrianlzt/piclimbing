## Climbing documentation

DSI?
https://backinsta.com/media/2297421343178551473_2208980241/B_iFIoTjvCx
DSI
 fuerza max en 250ms vs en 3s?
dynamic strength index



### MVC
[Differences in Climbing-Specific Strength Between Boulder and Lead Rock Climbers](https://journals.lww.com/nsca-jscr/Fulltext/2013/02000/Differences_in_Climbing_Specific_Strength_Between.5.aspx)

Dominant arm. Hold dimension not specified.

#### Crimp

Boulder (7b-8a): 9-11 N/kg

Lead (7c+-8c): 8-9 N/kg

#### Open crimp

Boulder (7b-8a): 8-9 N/kg

Lead (7c+-8c): 7.5-8.5 N/kg


### RFD
[Differences in Climbing-Specific Strength Between Boulder and Lead Rock Climbers](https://journals.lww.com/nsca-jscr/Fulltext/2013/02000/Differences_in_Climbing_Specific_Strength_Between.5.aspx)

Dominant arm. Hold dimension not specified.

#### Crimp

Boulder (7b-8a): 45-65 N/s/kg

Lead (7c+-8c): 32-48 N/s/kg

#### Open crimp

Boulder (7b-8a): 50-65 N/s/kg

Lead (7c+-8c): 35-52 N/s/kg



## Raspberry Pi Zero W
TODO driver y kernel para el hx711
Mirar si con el driver normal y subiendo el nivel de verbose va rápido

### KY040 / rotatory encoder
Pin CLK and DT to
TODO

### HX711 / Load cell
https://journals.lww.com/nsca-jscr/Fulltext/2013/02000/Differences_in_Climbing_Specific_Strength_Between.5.aspx
In this study the sampling rate was 1kHz (1ms)

TODO: How to measure faster from the cell load?


### Config
``/boot/config.txt``

```
[all]
dtoverlay=rotary-encoder,pin_a=4,pin_b=22,relative_axis=1,steps-per-period=2
dtoverlay=hx711
```

## Databases

### Influxdb
Too resource intensive for raspi zero

### VictoriaMetrics
With function "keep_last_value" to fill the nulls and scrapping 25ms

## Troubleshooting
Reading jumping forward/backwards: check the connections, maybe a loosing cable (seen with Vcc being loose)


## Development

Run database and visualizer:
TODO: como cargar los dashboards en el arranque y el datasource
```
docker run --name victoria-climb --rm -d -p 8089:8089/udp victoriametrics/victoria-metrics -influxListenAddr 0.0.0.0:8089
docker run --name grafana-climb --link victoria-climb:victoria --rm -d -p 3000:3000 grafana/grafana
```

Access grafana: http://localhost:3000
User: admin
Pass: admin

New datasource, Prometheus: http://victoria:8428
Scrape interval: 25ms


gqlgen server, hack to avoid reconnection from apollo client
https://github.com/99designs/gqlgen/issues/1179
Removed that line
