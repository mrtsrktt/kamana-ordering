import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-4">Siparişiniz Alındı!</h1>
        <p className="text-gray-600 mb-6">
          Siparişiniz Kamana tarafından alındı. Teslimat zamanı WhatsApp üzerinden size bildirilecektir.
        </p>
        <button
          onClick={() => router.push('/products')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Ürünlere Dön
        </button>
      </div>
    </div>
  );
}
