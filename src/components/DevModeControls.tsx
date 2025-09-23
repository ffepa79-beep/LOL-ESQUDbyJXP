import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Database,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface DevModeControlsProps {
  isDevMode: boolean;
  onToggleDevMode: (enabled: boolean) => void;
  onResetToDefault: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  playerCount: number;
}

const DevModeControls = ({
  isDevMode,
  onToggleDevMode,
  onResetToDefault,
  onClearAll,
  onExport,
  onImport,
  playerCount
}: DevModeControlsProps) => {
  
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          onImport(content);
          toast.success("Jogadores importados com sucesso!");
        } catch (error) {
          toast.error("Erro ao importar arquivo. Verifique se é um JSON válido.");
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = "";
  };

  const handleResetConfirm = () => {
    if (window.confirm("Tem certeza que deseja restaurar os dados padrão? Todos os jogadores personalizados serão perdidos.")) {
      onResetToDefault();
      toast.success("Dados restaurados para o padrão!");
    }
  };

  const handleClearConfirm = () => {
    if (window.confirm("Tem certeza que deseja apagar TODOS os jogadores? Esta ação não pode ser desfeita.")) {
      onClearAll();
      toast.success("Todos os jogadores foram removidos!");
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-primary">
            <Settings className="w-5 h-5 mr-2" />
            Controles do Sistema
          </span>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{playerCount} jogadores</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Dev Mode */}
        <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border/50">
          <div className="space-y-1">
            <Label htmlFor="dev-mode" className="text-base font-medium">
              Modo Desenvolvedor
            </Label>
            <p className="text-sm text-muted-foreground">
              Permite editar, adicionar e remover jogadores
            </p>
          </div>
          <Switch
            id="dev-mode"
            checked={isDevMode}
            onCheckedChange={onToggleDevMode}
          />
        </div>

        {isDevMode && (
          <>
            {/* Gerenciamento de Dados */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Gerenciamento de Dados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={onExport}
                  variant="outline"
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Jogadores
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start pointer-events-none"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Jogadores
                  </Button>
                </div>
              </div>
            </div>

            {/* Ações Perigosas */}
            <div className="space-y-3">
              <h3 className="font-medium text-destructive flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Zona Perigosa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleResetConfirm}
                  variant="outline"
                  className="justify-start border-yellow-600 text-yellow-600 hover:bg-yellow-600/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar Padrão
                </Button>
                
                <Button
                  onClick={handleClearConfirm}
                  variant="destructive"
                  className="justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Todos
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Informações */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h3 className="font-medium text-primary mb-2">Informações</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Os dados são salvos automaticamente no navegador</p>
            <p>• Use exportar/importar para backup ou transferência</p>
            <p>• Modo público permite usuários adicionarem jogadores</p>
            {isDevMode && <p>• Modo dev permite edição completa dos dados</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevModeControls;