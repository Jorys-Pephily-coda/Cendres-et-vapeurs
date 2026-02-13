
import subprocess
import signal
import os
from django.conf import settings


class MarketSimulator:
    
    _process = None
    _pid_file = os.path.join(settings.BASE_DIR, 'market_simulator.pid')
    
    @classmethod
    def is_running(cls):
        if not os.path.exists(cls._pid_file):
            return False
        
        try:
            with open(cls._pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            os.kill(pid, 0)  
            return True
        except (OSError, ValueError):
            cls._cleanup_pid_file()
            return False
    
    @classmethod
    def start(cls, interval=5, volatility=1.0, influence=1.0):
        if cls.is_running():
            return {'error': 'Une simulation est déjà en cours'}
        
        # Démarrer le processus
        process = subprocess.Popen(
            [
                'python', 
                'manage.py', 
                'simulate_market',
                f'--interval={interval}',
                f'--volatility={volatility}',
                f'--influence={influence}'
            ],
            cwd=settings.BASE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True
        )
        
        # Sauvegarder le PID
        with open(cls._pid_file, 'w') as f:
            f.write(str(process.pid))
        
        return {
            'message': 'Simulation démarrée',
            'pid': process.pid,
            'interval': interval,
            'volatility': volatility,
            'influence': influence
        }
    
    @classmethod
    def stop(cls):
        if not os.path.exists(cls._pid_file):
            return {'error': 'Aucune simulation en cours'}
        
        try:
            with open(cls._pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            if os.name == 'nt':
                os.kill(pid, signal.CTRL_BREAK_EVENT)
            else:
                os.kill(pid, signal.SIGTERM)
            
            cls._cleanup_pid_file()
            
            return {'message': 'Simulation arrêtée'}
        
        except (OSError, ValueError) as e:
            cls._cleanup_pid_file()
            return {'error': f'Erreur lors de l\'arrêt: {str(e)}'}
    
    @classmethod
    def status(cls):
        """Retourne le statut de la simulation"""
        is_running = cls.is_running()
        
        result = {
            'is_running': is_running
        }
        
        if is_running:
            try:
                with open(cls._pid_file, 'r') as f:
                    result['pid'] = int(f.read().strip())
            except:
                pass
        
        return result
    
    @classmethod
    def _cleanup_pid_file(cls):
        """Nettoie le fichier PID"""
        try:
            if os.path.exists(cls._pid_file):
                os.remove(cls._pid_file)
        except:
            pass
