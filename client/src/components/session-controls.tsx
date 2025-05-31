import { Plus, Flag, Pause, Square, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/hooks/use-session';

export function SessionControls() {
  const { 
    currentSession, 
    sessionMetrics, 
    startSession, 
    endSession, 
    addStroke, 
    markLap,
    isStarting,
    isEnding 
  } = useSession();
  
  const [sessionName, setSessionName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartSession = () => {
    if (sessionName.trim()) {
      startSession(sessionName);
      setSessionName('');
      setIsDialogOpen(false);
    }
  };

  const handleAddStroke = () => {
    // Generate realistic stroke data
    const speed = 1.8 + Math.random() * 0.8; // 1.8-2.6 m/s
    const efficiency = 75 + Math.random() * 20; // 75-95%
    const rate = 28 + Math.random() * 12; // 28-40 SPM
    
    addStroke(speed, efficiency, rate);
  };

  if (!currentSession || !sessionMetrics.isActive) {
    return (
      <div className="mx-4 my-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primaryDark text-white py-3">
              <Play className="w-4 h-4 mr-2" />
              Start Training Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Session name (e.g., Morning Training)"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartSession()}
              />
              <Button 
                onClick={handleStartSession} 
                disabled={!sessionName.trim() || isStarting}
                className="w-full"
              >
                {isStarting ? 'Starting...' : 'Start Session'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <section className="mx-4 my-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-neutral">Quick Actions</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleAddStroke}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-primary text-white hover:bg-primaryDark"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stroke</span>
          </Button>
          
          <Button 
            onClick={markLap}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-secondary text-white hover:bg-green-600"
          >
            <Flag className="w-4 h-4" />
            <span>Mark Lap</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center justify-center space-x-2 py-3 px-4 border-warning text-warning hover:bg-warning hover:text-white"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </Button>
          
          <Button 
            onClick={endSession}
            disabled={isEnding}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-error text-white hover:bg-red-600"
          >
            <Square className="w-4 h-4" />
            <span>{isEnding ? 'Ending...' : 'End Session'}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
