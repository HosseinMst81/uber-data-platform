import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MapPinOff, Home } from 'lucide-react'

const NotfoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="relative text-center">
        <span
          className="pointer-events-none select-none text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/20"
          aria-hidden
        >
          404
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <MapPinOff className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-foreground">
            Route not found
          </h1>
          <Button variant={'link'} asChild className="mt-4 gap-2" size="lg">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Trips
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotfoundPage
