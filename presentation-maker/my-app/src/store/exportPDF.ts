import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Slide, PlainText, Image, Color, Picture } from './types';
import type { RootState } from './store';

type SlideObject = PlainText | Image;

async function loadImageWithCORS(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {

      if (src.includes('appwrite.io') || src.includes('storage')) {
        if (src.includes('appwrite.io')) {
          const previewUrl = src.replace('/view?', '/preview?width=800&height=600&');

          const previewImg = new Image();
          previewImg.crossOrigin = 'anonymous';
          previewImg.src = previewUrl;

          previewImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = previewImg.width;
            canvas.height = previewImg.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(previewImg, 0, 0);
              resolve(canvas.toDataURL('image/jpeg', 0.95));
            }
          };

          previewImg.onerror = () => {
            resolve(createPlaceholderImage());
          };
        } else {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(src)}`;
          const proxyImg = new Image();
          proxyImg.crossOrigin = 'anonymous';
          proxyImg.src = proxyUrl;

          proxyImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = proxyImg.width;
            canvas.height = proxyImg.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(proxyImg, 0, 0);
              resolve(canvas.toDataURL('image/jpeg', 0.95));
            }
          };

          proxyImg.onerror = () => {
            resolve(createPlaceholderImage());
          };
        }
      } else {
        resolve(createPlaceholderImage());
      }
    };
    img.src = src;

    if (img.complete) {
      img.dispatchEvent(new Event('load'));
    }
  });
}

function createPlaceholderImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Изображение', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/jpeg');
  }

  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
}

async function loadImageViaFetch(src: string): Promise<string> {
    if (src.includes('appwrite.io')) {
      const downloadUrl = src.replace('/view?', '/download?');
      src = downloadUrl;
    }

    const response = await fetch(src, {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'image/*',
      }
    });

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
}

export async function exportPresentationToPDF(
  slides: Slide[],
  slideObjects: Record<string, SlideObject[]>,
  options: {
    fileName?: string;
    slideWidth?: number;
    slideHeight?: number;
    quality?: number;
    margin?: number;
  } = {}
): Promise<void> {
  const {
    fileName = 'presentation.pdf',
    slideWidth = 1280,
    slideHeight = 720,
    quality = 10,
    margin = 10
  } = options;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [slideWidth + margin * 2, slideHeight + margin * 2]
  });

  if (slides.length === 0) {
    alert('Нет слайдов для экспорта');
    return;
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${slideWidth}px`;
  container.style.height = `${slideHeight}px`;
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideId = slide.id;

      const objects = slideObjects[slideId] || [];

      container.innerHTML = '';

      const slideElement = document.createElement('div');
      slideElement.style.width = '100%';
      slideElement.style.height = '100%';
      slideElement.style.position = 'relative';
      slideElement.style.overflow = 'hidden';
      slideElement.id = `slide-${slideId}`;

      if (slide.background.type === 'color') {
        const colorBackground = slide.background as Color;
        slideElement.style.backgroundColor = colorBackground.color;
      } else if (slide.background.type === 'picture') {
        const pictureBackground = slide.background as Picture;
        try {
          const bgDataUrl = await loadImageViaFetch(pictureBackground.src)
            .catch(() => loadImageWithCORS(pictureBackground.src));
          slideElement.style.backgroundImage = `url(${bgDataUrl})`;
        } catch {
          slideElement.style.backgroundColor = '#f0f0f0';
        }
        slideElement.style.backgroundSize = 'cover';
        slideElement.style.backgroundPosition = 'center';
        slideElement.style.backgroundRepeat = 'no-repeat';
      }

      const imagePromises: Array<Promise<{ element: HTMLImageElement, dataUrl: string }>> = [];

      objects.forEach((obj) => {
        if (obj.type === 'plain_text') {
          const textElement = document.createElement('div');
          textElement.style.position = 'absolute';
          textElement.style.left = `${obj.rect.x}px`;
          textElement.style.top = `${obj.rect.y}px`;
          textElement.style.width = `${obj.rect.width}px`;
          textElement.style.height = `${obj.rect.height}px`;
          textElement.style.fontFamily = obj.fontFamily || 'Arial';
          textElement.style.fontWeight = obj.weight?.toString() || '400';
          textElement.style.fontSize = `${(obj.scale || 1) * 16}px`;
          textElement.style.color = obj.color || '#000000';
          textElement.style.textAlign = obj.alignment || 'left';
          textElement.style.display = 'flex';
          textElement.style.alignItems = 'center';
          textElement.style.justifyContent = 'flex-start';
          textElement.style.overflow = 'hidden';
          textElement.style.wordBreak = 'break-word';
          textElement.textContent = obj.content || '';

          slideElement.appendChild(textElement);
        } else if (obj.type === 'picture') {
          const imageObj = obj as Image;
          const imgElement = document.createElement('img');
          imgElement.id = `img-${slideId}-${obj.id}`;
          imgElement.style.position = 'absolute';
          imgElement.style.left = `${obj.rect.x}px`;
          imgElement.style.top = `${obj.rect.y}px`;
          imgElement.style.width = `${obj.rect.width}px`;
          imgElement.style.height = `${obj.rect.height}px`;
          imgElement.style.objectFit = 'cover';
          imgElement.style.border = 'none';

          imgElement.src = createPlaceholderImage();

          const imagePromise = (async () => {
            try {
              const dataUrl = await loadImageViaFetch(imageObj.src);
              return { element: imgElement, dataUrl };
            } catch {
              try {
                const dataUrl = await loadImageWithCORS(imageObj.src);
                return { element: imgElement, dataUrl };
              } catch {
                return { element: imgElement, dataUrl: createPlaceholderImage() };
              }
            }
          })();

          imagePromises.push(imagePromise);
          slideElement.appendChild(imgElement);
        }
      });

      container.appendChild(slideElement);

      const loadedImages = await Promise.all(imagePromises);
      loadedImages.forEach(({ element, dataUrl }) => {
        element.src = dataUrl;
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      let backgroundColor = '#ffffff';
      if (slide.background.type === 'color') {
        backgroundColor = (slide.background as Color).color;
      }

      const canvas = await html2canvas(slideElement, {
        scale: quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        logging: true,
        imageTimeout: 60000,
        removeContainer: false,
      });

      if (i > 0) {
        pdf.addPage();
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.9);

      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin,
        slideWidth,
        slideHeight
      );
    }
    pdf.save(fileName);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function exportCurrentPresentation(
  storeState: RootState,
  fileName?: string
): Promise<void> {
  const { presentation, slides, slideObjects } = storeState;
  const fileNameWithExtension = fileName || `${presentation.title || 'presentation'}.pdf`;

  return await exportPresentationToPDF(
    slides.slides,
    slideObjects.objects,
    {
      fileName: fileNameWithExtension,
      quality: 10
    }
  );
}