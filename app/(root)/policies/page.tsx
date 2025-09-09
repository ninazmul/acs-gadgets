import Loader from "@/components/shared/Loader";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISetting } from "@/lib/database/models/setting.model";

export default async function PoliciesPage() {
  const settings: ISetting | null = await getSetting();

  if (!settings) {
    return <Loader />;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="wrapper max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">
          {settings.name}&apos;s <span className="text-primary-600">Policies</span>
        </h1>

        <div className="grid grid-cols-1 gap-12">
          {/* Return Policy */}
          {settings.returnPolicy && (
            <div
              id="return-policy"
              className="bg-white dark:bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Return Policy
              </h2>
              <div
                className="
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-bold prose-strong:text-black
                prose-em:text-gray-800 prose-em:italic
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:font-medium
                prose-img:rounded-lg prose-img:shadow-md
                prose prose-lg dark:prose-invert max-w-none mb-12
                "
                dangerouslySetInnerHTML={{ __html: settings.returnPolicy }}
              />
            </div>
          )}

          {/* Terms of Service */}
          {settings.termsOfService && (
            <div
              id="terms-of-service"
              className="bg-white dark:bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Terms of Service
              </h2>
              <div
                className="
                  prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-bold prose-strong:text-black
                prose-em:text-gray-800 prose-em:italic
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:font-medium
                prose-img:rounded-lg prose-img:shadow-md
                prose prose-lg dark:prose-invert max-w-none mb-12
                  "
                dangerouslySetInnerHTML={{ __html: settings.termsOfService }}
              />
            </div>
          )}

          {/* Privacy Policy */}
          {settings.privacyPolicy && (
            <div
              id="privacy-policy"
              className="bg-white dark:bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Privacy Policy
              </h2>
              <div
                className="
                  prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-bold prose-strong:text-black
                prose-em:text-gray-800 prose-em:italic
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:font-medium
                prose-img:rounded-lg prose-img:shadow-md
                prose prose-lg dark:prose-invert max-w-none mb-12
                  "
                dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
