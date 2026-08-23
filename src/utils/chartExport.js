import html2canvas from 'html2canvas';

export async function exportElementAsPng(element, { fileName, shareTitle, shareText }) {
  if (!element) return false;

  const canvas = await html2canvas(element, {
    backgroundColor: '#0a0e17',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  if (blob && typeof navigator.share === 'function') {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
        });
        return true;
      }
    } catch {
      /* cancelled or unsupported → download */
    }
  }

  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
  return true;
}
