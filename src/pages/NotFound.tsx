import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="space-y-3">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="glass-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            className="glass-button neon-glow"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound