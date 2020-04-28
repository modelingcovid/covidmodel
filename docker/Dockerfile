FROM arnoudbuzing/wolframengine

# The model code expects to be in this location when resolving relative imports.
WORKDIR /root/Github/covidmodel/
COPY model ./model/

ENTRYPOINT ["/usr/bin/wolframscript"]