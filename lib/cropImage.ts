export const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<Blob> => {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
      image.src = url
    })

  return new Promise(async (resolve, reject) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return reject(new Error('No 2d context'))
    }

    // set width to double image natural width
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    ctx.drawImage(image, 0, 0)

    const data = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight)

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image at the top left corner
    ctx.putImageData(
      data,
      0 - pixelCrop.x,
      0 - pixelCrop.y
    )

    // As a blob
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      resolve(blob)
    }, 'image/jpeg', 0.95)
  })
}
