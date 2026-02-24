import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <span className="font-black text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span>
                </span>
                <div className="w-8" />
            </div>

            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                        <MessageSquare className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
                    <p className="text-gray-500 text-lg">Have questions or feedback? We'd love to hear from you.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Email Us</h2>
                        <p className="text-gray-500 mb-4">Drop us a line and we'll get back to you within 24 hours.</p>
                        <a
                            href="mailto:go.aroundu@gmail.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <Mail className="w-5 h-5" />
                            go.aroundu@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
