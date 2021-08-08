FROM emscripten/emsdk:1.40.0 
RUN apt-get update && apt-get install -qqy autoconf libtool pkg-config 
ENV CFLAGS "-Os -flto" 
ENV CXXFLAGS "${CFLAGS} -std=c++17" 
ENV LDFLAGS liCFLAGSI" 
RUN emcc ${CXXFLAGS} --bind -xc++ /dev/null -o /dev/null 
WORKDIR /srcl 
CMD ["sh", "-c", "emmake make -j `nproc`"] 