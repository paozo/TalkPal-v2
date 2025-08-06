import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

// ユーザーIDに基づいてKVストアのキーを生成するヘルパー関数
// 本格的なアプリでは、認証情報からユーザーIDを取得します。
// 今回はデモのため、固定のキーを使用します。
const getHistoryKey = () => {
  // TODO: 将来的にユーザー認証を導入した場合、ここをユーザーIDに置き換える
  return 'user:default_user:history';
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const historyKey = getHistoryKey();

  // GETリクエスト：履歴の取得
  if (req.method === 'GET') {
    try {
      const history = await kv.lrange(historyKey, 0, -1);
      res.status(200).json(history);
    } catch (error) {
      console.error('KV get error:', error);
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  }
  // POSTリクエスト：履歴の保存
  else if (req.method === 'POST') {
    try {
      const newHistoryItem = req.body;
      if (!newHistoryItem || !newHistoryItem.id) {
        return res.status(400).json({ error: 'Invalid history item provided' });
      }
      // リストの先頭に新しい履歴を追加
      await kv.lpush(historyKey, newHistoryItem);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('KV set error:', error);
      res.status(500).json({ error: 'Failed to save history' });
    }
  }
  // その他のメソッドは許可しない
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
