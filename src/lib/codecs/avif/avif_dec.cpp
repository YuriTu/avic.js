#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "avif/avif.h"


using namespace emscripten;

thread_local const val Uint8ClampedArray = val::global("Uint8ClampedArray");
thread_local const val ImageData = val::global("ImageData");
thread_local const val Array = val::global("Array");
thread_local const val Object = val::global("Object");


val decode(std::string avifimage) {
  // point raw.data and raw.size to the contents of an .avif(s)
  avifROData raw = {
    .data = (uint8_t*)avifimage.c_str(),
    .size = avifimage.length()
  };

  avifImage* image = avifImageCreateEmpty();
  avifDecoder* decoder = avifDecoderCreate();
  avifResult decodeResult = avifDecoderRead(decoder, image, &raw);
  avifDecoderDestroy(decoder);

  val result = val::null();

  if (decodeResult == AVIF_RESULT_OK) {
    avifRGBImage rgb;
    avifRGBImageSetDefaults(&rgb, image);
    rgb.depth = 8;

    avifRGBImageAllocatePixels(&rgb);
    avifImageYUVToRGB(image, &rgb);

    result = ImageData.new_(Uint8ClampedArray.new_(typed_memory_view(rgb.rowBytes * rgb.height, rgb.pixels)), rgb.width, rgb.height);

    avifRGBImageFreePixels(&rgb);
  }

  avifImageDestroy(image);

  return result;
}

val decodeAni(std::string avifimage) {
    avifROData raw = {
        .data = (uint8_t*)avifimage.c_str(),
        .size = avifimage.length()
    };

    avifDecoder* decoder = avifDecoderCreate();
    avifResult decodeResult = avifDecoderParse(decoder, &raw);

    val result = Object.new_();
    val images = Array.new_();

    val item = val::null();

    if (decodeResult == AVIF_RESULT_OK) {
        int imageCount = decoder->imageCount;
        double duration = decoder->duration;
        int decodedCount = 0;
        for (;;) {
            avifResult nextImageResult = avifDecoderNextImage(decoder);

            if (nextImageResult == AVIF_RESULT_NO_IMAGES_REMAINING) {
                if (imageCount != decodedCount) {
                    printf("images count error");
                }
                break;
            } else if (nextImageResult != AVIF_RESULT_OK) {
                printf("ERROR: Failed to decode all frames: %s\n", avifResultToString(nextImageResult));
                break;
            }

//            解码完成，
            avifRGBImage rgb;
            avifRGBImageSetDefaults(&rgb, decoder->image);
            rgb.depth = 8;

            avifRGBImageAllocatePixels(&rgb);
            avifImageYUVToRGB(decoder->image, &rgb);

            item = val::null();
            item = ImageData.new_(Uint8ClampedArray.new_(typed_memory_view(rgb.rowBytes * rgb.height, rgb.pixels)), rgb.width, rgb.height);

            images.call<val>("push",item);

        }
        avifImageDestroy(decoder->image);
        avifDecoderDestroy(decoder);

        result.set("duration",val(duration));
        result.set("images",images);

    }


    return result;
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("decode", &decode);
  function("decodeAni", &decodeAni);
}