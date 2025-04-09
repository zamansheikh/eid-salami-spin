import { Github } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-3 mt-4 border-t border-amber-100 bg-white bg-opacity-50">
      <div className="max-w-[600px] mx-auto px-4 flex items-center justify-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} | Dev:
          <Link
            href="https://github.com/zamansheikh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center ml-1 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Github size={12} className="mr-1" />
            zamansheikh
          </Link>
        </p>
      </div>
    </footer>
  )
}
