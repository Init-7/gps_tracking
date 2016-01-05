Pasos instalación de Traccar (en Centos 7)
=========================================
	
* instalar JAVA

> ~$ su -c "yum install java-1.8.0-openjdk"

* descarga instalador:
> ~$ wget https://github.com/tananaev/traccar/releases/download/v3.3/traccar-linux-64-3.3.zip

* descomprimir archivo
> ~$ unzip traccar-linux-64-3.3.zip

* Correr instalador
> ~$ sudo ./traccar.run 

* iniciar demonio
>  sudo /opt/traccar/bin/traccar start

luego de realizar estos pasos, dirijirse a la pagina de traccar: 

  http://localhost:8082/

insertamos los datos de administrador:

  user: admin
  pass: admin

el sistema se encuentra operativo para ser utilizado.
