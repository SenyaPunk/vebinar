export async function initializeVoiceStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('Error accessing microphone:', err);
    return null;
  }
}

export async function initializeScreenShare(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({ 
      video: {
        cursor: "always"
      },
      audio: false
    });
  } catch (err) {
    console.error('Error accessing screen share:', err);
    return null;
  }
}