import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Play, Pause, Square } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TimeTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const handleStartTracking = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task description before starting the timer.",
        variant: "destructive",
      });
      return;
    }
    setIsTracking(true);
    toast({
      title: "Timer Started",
      description: `Started tracking time for: ${currentTask}`,
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Timer Stopped",
      description: "Time entry has been saved to your timesheet.",
    });
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Tracker
        </CardTitle>
        <CardDescription className="text-gray-400">
          Start tracking time for your current task
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              What are you working on?
            </label>
            <Input
              placeholder="Enter task description..."
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="glass-effect border-white/10 text-white placeholder-gray-400"
              disabled={isTracking}
            />
          </div>
          <div className="flex gap-2">
            {!isTracking ? (
              <Button 
                onClick={handleStartTracking}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setIsTracking(false)}
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={handleStopTracking}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
        
        {isTracking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 glass-effect rounded-lg border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{currentTask}</p>
                <p className="text-gray-400 text-sm">Currently tracking</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">00:45:32</p>
                <p className="text-gray-400 text-sm">Elapsed time</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeTracker;