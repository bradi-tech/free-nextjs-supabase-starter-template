import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Supauth</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Secure, Simple, Seamless Authentication
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Image
              src="/logo.png"
              alt="Supauth Logo"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              At Supauth, we believe authentication should be both secure and user-friendly. 
              Our platform provides robust authentication solutions while maintaining an 
              intuitive user experience.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We're committed to protecting user data with industry-leading security practices
              while making the authentication process as smooth as possible.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border dark:border-zinc-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Security First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced encryption and security measures to protect your data
            </p>
          </div>
          <div className="p-6 border dark:border-zinc-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Easy Integration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Simple setup process with comprehensive documentation
            </p>
          </div>
          <div className="p-6 border dark:border-zinc-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Dedicated support team ready to help whenever you need
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
