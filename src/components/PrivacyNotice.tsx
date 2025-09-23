import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";

interface PrivacyNoticeProps {
  isAuthenticated: boolean;
}

const PrivacyNotice = ({ isAuthenticated }: PrivacyNoticeProps) => {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">Modo Desenvolvedor:</span> Você pode ver nomes reais e gerenciar todos os jogadores.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <EyeOff className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Modo Público:</span> Nomes reais estão ocultos por privacidade. Faça login como desenvolvedor para acesso completo.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyNotice;