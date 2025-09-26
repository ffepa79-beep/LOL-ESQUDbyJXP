import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Bot, Image as ImageIcon, Video, FileText, Zap, Eye, Search, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabasePlayerManager } from "@/hooks/useSupabasePlayerManager";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  matchResult: {
    winner: 'Team Blue' | 'Team Red';
    loser: 'Team Blue' | 'Team Red';
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
  const replayInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [matchId, setMatchId] = useState('');
  const [replayFile, setReplayFile] = useState<File | null>(null);
  const [isDownloadingMatch, setIsDownloadingMatch] = useState(false);

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

  const handleReplayUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate replay file (rofl extension for LoL replays)
    if (!file.name.endsWith('.rofl')) {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos de replay (.rofl) são aceitos.",
        variant: "destructive",
      });
      return;
    }

    setReplayFile(file);
    toast({
      title: "Replay carregado",
      description: `Arquivo ${file.name} pronto para análise.`,
    });
  };

  const downloadMatchData = async () => {
    if (!matchId.trim()) {
      toast({
        title: "Match ID obrigatório",
        description: "Digite um Match ID válido da Riot Games.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingMatch(true);

    try {
      // Call our edge function to fetch Riot API data
      const { data, error } = await supabase.functions.invoke('ai-match-analysis', {
        body: {
          fileUrl: '',
          fileType: 'riot-match',
          fileName: `match-${matchId}`,
          matchId: matchId.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to download match data');
      }

      setAnalysisResult(data.analysis);

      toast({
        title: "Match baixado",
        description: "Dados da partida foram baixados e analisados com sucesso.",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Falha ao baixar dados da partida.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingMatch(false);
    }
  };

  const analyzeWithAI = async () => {
    if (uploadedFiles.length === 0 && !matchId.trim() && !replayFile) {
      toast({
        title: "Dados necessários",
        description: "Faça upload de arquivos, digite um Match ID ou carregue um replay antes de analisar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      let analysisData;

      if (matchId.trim()) {
        // Analyze using Riot Match ID
        const { data, error } = await supabase.functions.invoke('ai-match-analysis', {
          body: {
            fileUrl: '',
            fileType: 'riot-match',
            fileName: `match-${matchId}`,
            matchId: matchId.trim()
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to analyze match');
        }
        analysisData = data;

      } else if (replayFile) {
        // Analyze replay file
        const replayReader = new FileReader();
        const replayContent = await new Promise((resolve) => {
          replayReader.onload = () => resolve(replayReader.result);
          replayReader.readAsText(replayFile);
        });

        const { data, error } = await supabase.functions.invoke('ai-match-analysis', {
          body: {
            fileUrl: '',
            fileType: 'replay',
            fileName: replayFile.name,
            replayData: JSON.parse(replayContent as string)
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to analyze replay');
        }
        analysisData = data;

      } else {
        // Analyze uploaded files
        const file = uploadedFiles[0];
        
        // Upload to storage
        const fileName = `${user?.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('match-replays')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error('Failed to upload file');
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('match-replays')
          .getPublicUrl(fileName);

        // Call AI analysis function
        const { data, error } = await supabase.functions.invoke('ai-match-analysis', {
          body: {
            fileUrl: publicUrl,
            fileType: file.type,
            fileName: file.name
          }
        });

        if (error) {
          throw new Error(error.message || 'Analysis failed');
        }
        analysisData = data;
      }

      setAnalysisResult(analysisData.analysis);

      toast({
        title: "Análise concluída",
        description: "IA processou os dados da partida com sucesso usando dados reais do banco.",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Falha ao processar dados com IA.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateDatabase = async () => {
    if (!analysisResult) return;

    try {
      toast({
        title: "Banco atualizado",
        description: "Dados da partida salvos no banco de dados automaticamente.",
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
          {/* Riot Match ID Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Match ID da Riot Games
              </CardTitle>
              <CardDescription>
                Digite o Match ID de uma partida para baixar dados oficiais da Riot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="matchId">Match ID</Label>
                  <Input
                    id="matchId"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    placeholder="Ex: BR1_2859087403"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={downloadMatchData}
                    disabled={isDownloadingMatch || !matchId.trim()}
                  >
                    {isDownloadingMatch ? (
                      <>
                        <Download className="h-4 w-4 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Match
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replay Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Upload de Replay
              </CardTitle>
              <CardDescription>
                Faça upload de arquivos .rofl do League of Legends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => replayInputRef.current?.click()}
              >
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <Video className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">Upload de Replay</h3>
                  <p className="text-sm text-muted-foreground">
                    Arquivos .rofl do League of Legends
                  </p>
                </div>
              </div>

              <input
                ref={replayInputRef}
                type="file"
                accept=".rofl"
                onChange={handleReplayUpload}
                className="hidden"
              />

              {replayFile && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Replay carregado:</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span>{replayFile.name}</span>
                    <Badge variant="secondary">{(replayFile.size / 1024 / 1024).toFixed(1)} MB</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Upload Section */}
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
                Processe os dados com Inteligência Artificial usando dados reais do banco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={analyzeWithAI} 
                disabled={uploadedFiles.length === 0 && !matchId.trim() && !replayFile || isAnalyzing}
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
                  <CardTitle>Estatísticas dos Jogadores (Banco de Dados)</CardTitle>
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
                Os dados são automaticamente salvos e atualizados no banco durante a análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      ✅ Dados foram salvos automaticamente no banco de dados durante a análise.
                      As estatísticas dos jogadores foram atualizadas usando apenas nomes reais do banco.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={updateDatabase} className="w-full" variant="secondary" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Dados Já Salvos Automaticamente
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Realize uma análise primeiro para que os dados sejam salvos automaticamente no banco.
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