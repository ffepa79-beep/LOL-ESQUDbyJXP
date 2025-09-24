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
                  <span className="text-primary font-medium">Modo Desenvolvedor:</span> Você pode gerenciar todos os jogadores e suas informações.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Modo Público:</span> Nomes reais são visíveis para todos. Faça login como desenvolvedor para gerenciar jogadores.
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