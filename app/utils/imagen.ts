const generateImage = async (prompt: string, sampleCount: number, seed?: number, aspectRatio: string = '1:1') => {
  const queryParams = new URLSearchParams({
    prompt,
    sampleCount: sampleCount.toString(),
    seed: seed ? seed.toString() : '',
    aspectRatio,
  });

  const response = await fetch(`/api/generateImage?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate image');
  }

  const data = await response.json();
  return data;
};


export { generateImage }