/**
 * 画像アップロード共通関数
 * WithFormData.tsxから抽出
 */

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * FormDataを使って画像をアップロード
 * @param uri - 画像のURI (file://, blob:, data: など)
 * @param endpoint - アップロード先エンドポイント (省略時はデフォルト)
 * @returns アップロード結果
 */
export async function uploadImageAsync(
  uri: string,
  endpoint?: string
): Promise<UploadResult> {
  const apiUrl = endpoint || 'https://httpbin.org/post';

  try {
    // URIから拡張子を取得
    const uriArray = uri.split('.');
    const fileType = uriArray[uriArray.length - 1];

    // FormDataを構築
    const formData = new FormData();
    formData.append('photo', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    // アップロード実行
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.warn('Upload result:', result);

    // httpbin.orgの場合はfiles.photoにURLが入る
    const imageUrl = result.files?.photo || uri;

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
