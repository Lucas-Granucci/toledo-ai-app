'use client';

import { useRouter } from 'next/navigation';
// import './styles.css';

export default function Home() {

  const router = useRouter();

  const goToChatbot = () => {
    router.push('/chatbot');
  }

  return (
    <div>
      {/* Header */}
      <header class="bg-slate-50/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
          <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
              <a href="#" class="text-2xl font-bold text-slate-900">Toledo<span class="text-cyan-600">AI</span></a>
              <div class="hidden md:flex items-center space-x-8">
                  <a href="#problem" class="nav-link text-slate-600 hover:text-cyan-600 font-medium">The Problem</a>
                  <a href="#solution" class="nav-link text-slate-600 hover:text-cyan-600 font-medium">Our Solution</a>
                  <a href="#audience" class="nav-link text-slate-600 hover:text-cyan-600 font-medium">Audience</a>
                  <a href="#features" class="nav-link text-slate-600 hover:text-cyan-600 font-medium">Features</a>
              </div>
              <button 
                  onClick={goToChatbot}
                  class="hidden md:inline-block bg-cyan-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-cyan-700 btn-primary cursor-pointer">
                  Launch App
              </button>
              {/* Mobile Menu Button (optional, for future enhancement) */}
              <button class="md:hidden text-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
              </button>
          </nav>
      </header>

      {/* Main Content */}
      <main>
          {/* Hero Section */}
          <section id="launcher" class="py-24 md:py-32 bg-white">
              <div class="container mx-auto px-6 text-center">
                  <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
                      Scientific Translation for a <br class="hidden md:inline" /> <span class="text-cyan-600">Global
                          Audience</span>
                  </h1>
                  <p class="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
                      Breaking down language barriers in research. Upload documents, get accurate translations, and
                      interact with scientific material in your native language.
                  </p>

                  {/* Chatbot Launcher */}
                  <div
                      class="max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-2xl shadow-slate-200 border border-slate-200 flex items-center">
                      <input type="text" placeholder="Translate a document or ask a question..."
                          class="w-full bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-lg px-4"
                          disabled />
                      <button
                          class="bg-cyan-600 text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-cyan-700 btn-primary flex-shrink-0 cursor-pointer"
                          onClick={goToChatbot}>
                          Launch Translator
                      </button>
                  </div>
                  <p class="text-sm text-slate-500 mt-4">Get started instantly. PDF, DOCX, and more supported.</p>
              </div>
          </section>

          {/* Problem Section */}
          <section id="problem" class="py-20 md:py-28">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-16">
                      <h2 class="text-3xl md:text-4xl font-bold text-slate-900">The Lingua Franca of Science Creates a
                          Divide</h2>
                      <p class="text-lg text-slate-600 mt-4 max-w-3xl mx-auto">English dominates academia, but this
                          excludes a vast majority of the global population from accessing and contributing to scientific
                          progress.</p>
                  </div>

                  <div class="grid md:grid-cols-2 gap-12 items-center">
                      <div class="bg-white p-8 rounded-lg border border-slate-200">
                          <h3 class="text-2xl font-bold text-cyan-600 mb-4">The Accessibility Gap</h3>
                          <p class="text-slate-600 text-lg leading-relaxed">
                              Generic translators fail with <strong class="text-slate-800">complex, domain-specific
                                  terminology</strong> found in biomedical, physics, and material science papers. This is
                              especially true for <strong class="text-slate-800">low-resource languages</strong> where
                              data is scarce, creating a systemic barrier to the democratization of knowledge.
                          </p>
                      </div>
                      <div class="text-center md:text-left">
                          <p class="text-6xl md:text-8xl font-extrabold text-slate-300">95.2%</p>
                          <p class="text-xl font-semibold text-slate-700 mt-2">Of the world's population are non-native
                              English speakers, facing a barrier to scientific literature.</p>
                          <p class="text-slate-500 text-sm mt-2">(Source: Ethnologue, 2025)</p>
                      </div>
                  </div>
              </div>
          </section>

          {/* Solution Section */}
          <section id="solution" class="py-20 md:py-28 bg-white">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-16">
                      <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Our Solution: Precision Through a Hybrid
                          Approach</h2>
                      <p class="text-lg text-slate-600 mt-4 max-w-3xl mx-auto">We combine fine-tuned models with powerful
                          APIs to deliver translations that are not just literal, but contextually and scientifically
                          accurate.</p>
                  </div>

                  <div
                      class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 bg-slate-50 p-8 md:p-12 rounded-xl border border-slate-200">
                      <div>
                          <h3 class="text-2xl font-bold text-slate-800 mb-3">Specialized Fine-Tuning</h3>
                          <p class="text-slate-600 leading-relaxed">
                              We train our models on synthetic data for <strong class="text-slate-700">low-resource
                                  languages</strong>, teaching them the specific vocabulary of scientific fields. This
                              ensures nuanced terms are translated correctly.
                          </p>
                      </div>
                      <div class="border-t-2 md:border-t-0 md:border-l-2 border-slate-200 pt-8 md:pt-0 md:pl-8">
                          <h3 class="text-2xl font-bold text-slate-800 mb-3">Interactive Engagement</h3>
                          <p class="text-slate-600 leading-relaxed">
                              Our chatbot interface doesn't just translate; it allows you to <strong
                                  class="text-slate-700">ask questions, clarify concepts, and engage</strong> with the
                              material, turning passive reading into active learning.
                          </p>
                      </div>
                  </div>
              </div>
          </section>

          {/* Target Audience Section */}
          <section id="audience" class="py-20 md:py-28">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-16">
                      <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Built For a Global Community</h2>
                      <p class="text-lg text-slate-600 mt-4 max-w-3xl mx-auto">ToledoAI empowers anyone, anywhere, to
                          engage with scientific research, from students to seasoned professionals.</p>
                  </div>
                  <div class="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-left">
                      <div class="bg-white p-8 rounded-lg border border-slate-200">
                          <h3 class="text-xl font-bold text-cyan-600 mb-3">Researchers & Academics</h3>
                          <p class="text-slate-600">Access and cite papers from outside your linguistic sphere, fostering
                              greater international collaboration and innovation.</p>
                      </div>
                      <div class="bg-white p-8 rounded-lg border border-slate-200">
                          <h3 class="text-xl font-bold text-cyan-600 mb-3">Students & Educators</h3>
                          <p class="text-slate-600">Break down barriers to learning with materials from around the world,
                              making education more equitable and comprehensive.</p>
                      </div>
                      <div class="bg-white p-8 rounded-lg border border-slate-200">
                          <h3 class="text-xl font-bold text-cyan-600 mb-3">Industry Professionals</h3>
                          <p class="text-slate-600">Stay on the cutting edge of R&D by understanding global scientific
                              advancements in fields like biotech, engineering, and more.</p>
                      </div>
                  </div>
              </div>
          </section>

          {/* Features Section */}
          <section id="features" class="py-20 md:py-28 bg-white">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-16">
                      <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Powerful Features, Simple Interface</h2>
                      <p class="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">Designed for researchers, students, and
                          professionals who need reliable scientific translations without the hassle.</p>
                  </div>

                  <div class="grid md:grid-cols-3 gap-8 text-center">
                      {/* Feature 1 */}
                      <div
                          class="bg-slate-50 p-8 rounded-lg border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <div
                              class="bg-cyan-100 text-cyan-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                  stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                          </div>
                          <h3 class="text-xl font-bold text-slate-800 mb-2">Seamless Document Upload</h3>
                          <p class="text-slate-600">Easily upload your scientific papers in various formats, including PDF
                              and DOCX, and let our system handle the rest.</p>
                      </div>
                      {/* Feature 2 */}
                      <div
                          class="bg-slate-50 p-8 rounded-lg border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <div
                              class="bg-cyan-100 text-cyan-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                  stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9.5A18.034 18.034 0 0112 8.444a18.034 18.034 0 01-3.5-3.5m6.088 9.5a18.034 18.034 0 01-3.5 3.5m0 0a18.034 18.034 0 01-3.5-3.5m6.088 9.5a18.034 18.034 0 01-3.5 3.5" />
                              </svg>
                          </div>
                          <h3 class="text-xl font-bold text-slate-800 mb-2">High-Accuracy Translation</h3>
                          <p class="text-slate-600">Get reliable translations that understand scientific context and
                              terminology, powered by our specialized AI models.</p>
                      </div>
                      {/* Feature 3 */}
                      <div
                          class="bg-slate-50 p-8 rounded-lg border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <div
                              class="bg-cyan-100 text-cyan-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                  stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                          </div>
                          <h3 class="text-xl font-bold text-slate-800 mb-2">Interactive Q&A</h3>
                          <p class="text-slate-600">Go beyond static text. Ask our chatbot clarifying questions about the
                              translated content to deepen your understanding.</p>
                      </div>
                  </div>
              </div>
          </section>
      </main>

      {/* Footer */}
      <footer class="bg-slate-800 text-slate-400">
          <div class="container mx-auto px-6 py-8 text-center">
              <a href="#" class="text-xl font-bold text-white">Toledo<span className="text-cyan-500">AI</span></a>
              <p class="mt-4 text-sm">Democratizing scientific knowledge across the globe.</p>
              <p class="mt-2 text-xs">&copy; 2025 ToledoAI. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
