docker build -t avic-codec-cpp - < ../cpp.Dockerfile
docker run --rm -v $PWD:/src avic-codec-cpp