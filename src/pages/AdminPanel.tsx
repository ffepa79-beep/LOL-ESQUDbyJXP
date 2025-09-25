import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Bot, Image as ImageIcon, Video, FileText, Zap, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabasePlayerManager } from "@/hooks/useSupabasePlayerManager";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  matchResult: {
    winner: 'Team 1' | 'Team 2';
    loser: 'Team 1' | 'Team 2';
  };
  playerStats: Array<{
    playerName: string;
    kda: { kills: number; deaths: number; assists: number };
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  bestPlay: {
    timestamp: string;
    description: string;
    player: string;
    confidence: number;
  };
}

const AdminPanel: React.FC = () => {
  const { isAuthenticated, user } = useSupabasePlayerManager();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Acesso restrito. Faça login como desenvolvedor para acessar este painel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Arquivos inválidos",
        description: "Apenas imagens (JPG, PNG, WEBP) e vídeos (MP4, WEBM) são permitidos.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(validFiles);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    toast({
      title: "Upload concluído",
      description: `${validFiles.length} arquivo(s) carregado(s) com sucesso.`,
    });
  };

  const analyzeWithAI = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo",
        description: "Faça upload de imagens ou vídeos antes de analisar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis result
      const mockResult: AnalysisResult = {
        matchResult: {
          winner: 'Team 1',
          loser: 'Team 2'
        },
        playerStats: [
          {
            playerName: 'Faker',
            kda: { kills: 12, deaths: 2, assists: 8 },
            performance: 'excellent'
          },
          {
            playerName: 'Caps',
            kda: { kills: 8, deaths: 4, assists: 12 },
            performance: 'good'
          },
          {
            playerName: 'Perkz',
            kda: { kills: 5, deaths: 6, assists: 9 },
            performance: 'average'
          }
        ],
        bestPlay: {
          timestamp: '24:35',
          description: 'Pentakill épico com Yasuo no Baron pit',
          player: 'Faker',
          confidence: 0.95
        }
      };

      setAnalysisResult(mockResult);

      toast({
        title: "Análise concluída",
        description: "IA processou os dados da partida com sucesso.",
      });

    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Falha ao processar dados com IA.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateDatabase = async () => {
    if (!analysisResult) return;

    try {
      // Here you would implement the database update logic
      // For now, we'll just show a success message
      toast({
        title: "Banco atualizado",
        description: "Dados da partida salvos no banco de dados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Falha ao atualizar banco de dados.",
        variant: "destructive",
      });
    }
  };

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-main">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
          Painel Admin IA
        </h1>
        <p className="text-muted-foreground">
          Análise automática de partidas do League of Legends com Inteligência Artificial
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Análise
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload de Mídia
              </CardTitle>
              <CardDescription>
                Faça upload de imagens ou vídeos das partidas para análise automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">Clique para fazer upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Suporta imagens (JPG, PNG, WEBP) e vídeos (MP4, WEBM)
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fazendo upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Arquivos carregados:</h4>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {file.type.startsWith('video/') ? (
                          <Video className="h-4 w-4 text-purple-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        )}
                        <span>{file.name}</span>
                        <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Análise com IA
              </CardTitle>
              <CardDescription>
                Processe os arquivos com Inteligência Artificial para extrair dados da partida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={analyzeWithAI} 
                disabled={uploadedFiles.length === 0 || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResult ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado da Partida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h3 className="font-semibold text-green-600">Vencedor</h3>
                      <p className="text-lg font-bold">{analysisResult.matchResult.winner}</p>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h3 className="font-semibold text-red-600">Perdedor</h3>
                      <p className="text-lg font-bold">{analysisResult.matchResult.loser}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas dos Jogadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.playerStats.map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-card-gradient rounded-lg border">
                        <div>
                          <h4 className="font-semibold">{player.playerName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {player.kda.kills}/{player.kda.deaths}/{player.kda.assists}
                          </p>
                        </div>
                        <Badge className={getPerformanceBadgeColor(player.performance)}>
                          {player.performance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Melhor Jogada da Partida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-gold/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{analysisResult.bestPlay.player}</h4>
                      <Badge variant="secondary">{analysisResult.bestPlay.timestamp}</Badge>
                    </div>
                    <p className="text-sm mb-2">{analysisResult.bestPlay.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confiança da IA:</span>
                      <Badge variant="outline">
                        {(analysisResult.bestPlay.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma análise disponível</h3>
                <p className="text-sm text-muted-foreground">
                  Faça upload e análise de arquivos para ver os resultados aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atualização Automática do Banco</CardTitle>
              <CardDescription>
                Salve automaticamente os dados analisados no banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Dados prontos para serem salvos no banco de dados. Clique no botão abaixo para confirmar.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={updateDatabase} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Atualizar Banco de Dados
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Realize uma análise primeiro para poder atualizar o banco de dados.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;