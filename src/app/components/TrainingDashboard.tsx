import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BookOpen, MessageSquare, Trophy, User } from 'lucide-react';
import img1 from 'figma:asset/f8748752632511ca9d5e277ebe7bd1852a4f27d6.png';
import img2 from 'figma:asset/e3a499839d85bc99e33a4e9ff7fae7e6219d5bf0.png';

interface Scenario {
  id: number;
  title: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  description: string;
  completed: boolean;
}

export function TrainingDashboard() {
  const [scenarios] = useState<Scenario[]>([
    {
      id: 1,
      title: 'Cliente solicita reembolso',
      difficulty: 'Fácil',
      description: 'Cliente insatisfecho con el producto solicita devolución de dinero',
      completed: true
    },
    {
      id: 2,
      title: 'Consulta sobre envío internacional',
      difficulty: 'Medio',
      description: 'Cliente pregunta sobre tiempos y costos de envío a otro país',
      completed: false
    },
    {
      id: 3,
      title: 'Cliente molesto - escalamiento',
      difficulty: 'Difícil',
      description: 'Cliente muy molesto que requiere manejo de situación compleja',
      completed: false
    },
    {
      id: 4,
      title: 'Problema técnico con la cuenta',
      difficulty: 'Medio',
      description: 'Cliente no puede acceder a su cuenta y ha olvidado su contraseña',
      completed: true
    },
    {
      id: 5,
      title: 'Consulta sobre promociones',
      difficulty: 'Fácil',
      description: 'Cliente pregunta sobre descuentos y promociones vigentes',
      completed: false
    },
    {
      id: 6,
      title: 'Queja sobre servicio previo',
      difficulty: 'Difícil',
      description: 'Cliente reclama por mal servicio de otro asesor anteriormente',
      completed: false
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil':
        return 'bg-green-100 text-green-800';
      case 'Medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difícil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = scenarios.filter(s => s.completed).length;
  const progress = Math.round((completedCount / scenarios.length) * 100);

  return (
    <div className="flex-1 overflow-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0F2C32] to-[#1a4750] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="mb-2">Sistema de Entrenamiento</h1>
          <p className="text-white/90 mb-6">Desarrolla tus habilidades de atención al cliente</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80">Escenarios Completados</p>
                  <p className="text-2xl">{completedCount}/{scenarios.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80">Progreso Total</p>
                  <p className="text-2xl">{progress}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80">Nivel Actual</p>
                  <p className="text-2xl">Intermedio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="scenarios">Escenarios de Práctica</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="progress">Mi Progreso</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="mb-6">
              <h2 className="mb-2">Escenarios Disponibles</h2>
              <p className="text-gray-600">Practica con situaciones reales de atención al cliente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                    {scenario.completed && (
                      <Badge className="bg-green-500 text-white">✓ Completado</Badge>
                    )}
                  </div>

                  <h3 className="mb-2">{scenario.title}</h3>
                  <p className="text-gray-600 mb-4">{scenario.description}</p>

                  <Button
                    className="w-full"
                    style={{ backgroundColor: '#0F2C32' }}
                    disabled={scenario.completed}
                  >
                    {scenario.completed ? 'Revisar' : 'Comenzar'}
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="mb-6">
              <h2 className="mb-2">Materiales de Apoyo</h2>
              <p className="text-gray-600">Consulta guías y recursos para mejorar tu desempeño</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <img src={img1} alt="Guía de atención" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="mb-2">Guía de Atención al Cliente</h3>
                <p className="text-gray-600 mb-4">Principios básicos y mejores prácticas para una excelente atención</p>
                <Button variant="outline" className="w-full">Ver Guía</Button>
              </Card>

              <Card className="p-6">
                <img src={img2} alt="Manual de protocolos" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="mb-2">Manual de Protocolos</h3>
                <p className="text-gray-600 mb-4">Procedimientos estándar para diferentes situaciones de servicio</p>
                <Button variant="outline" className="w-full">Ver Manual</Button>
              </Card>

              <Card className="p-6">
                <div className="bg-gray-100 w-full h-48 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="mb-2">Frases y Expresiones Útiles</h3>
                <p className="text-gray-600 mb-4">Banco de respuestas profesionales para diferentes contextos</p>
                <Button variant="outline" className="w-full">Explorar</Button>
              </Card>

              <Card className="p-6">
                <div className="bg-gray-100 w-full h-48 rounded-lg mb-4 flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="mb-2">Casos de Éxito</h3>
                <p className="text-gray-600 mb-4">Ejemplos de conversaciones exitosas y análisis detallado</p>
                <Button variant="outline" className="w-full">Ver Casos</Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="mb-6">
              <h2 className="mb-2">Seguimiento de Progreso</h2>
              <p className="text-gray-600">Revisa tu evolución y áreas de mejora</p>
            </div>

            <Card className="p-6">
              <h3 className="mb-4">Resumen de Rendimiento</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Escenarios Fáciles</span>
                    <span className="text-gray-600">1/2 completados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#0F2C32] h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Escenarios Medios</span>
                    <span className="text-gray-600">1/2 completados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#0F2C32] h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Escenarios Difíciles</span>
                    <span className="text-gray-600">0/2 completados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#0F2C32] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="mb-4">Habilidades en Desarrollo</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Empatía</Badge>
                  <Badge variant="outline">Resolución de Conflictos</Badge>
                  <Badge variant="outline">Comunicación Escrita</Badge>
                  <Badge variant="outline">Gestión de Tiempo</Badge>
                  <Badge variant="outline">Conocimiento del Producto</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
