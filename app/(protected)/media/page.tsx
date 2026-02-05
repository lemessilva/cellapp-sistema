import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ExternalLink, MessageSquare, MonitorPlay, Zap } from "lucide-react";
import Link from "next/link";

export default function MediaDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Mídia</h1>
      
      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Próximo Evento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Retiro 2k26</div>
            <p className="text-xs text-muted-foreground">Faltam 15 dias</p>
            <Button size="sm" className="w-full mt-4" variant="secondary" asChild>
              <Link href="/admin/eventos">Gerenciar</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Widget 2: Status Live */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Culto Ao Vivo</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">OFFLINE</div>
            <p className="text-xs text-muted-foreground">Nenhuma transmissão ativa</p>
            <Button size="sm" className="w-full mt-4" variant="outline">
              Iniciar Transmissão
            </Button>
          </CardContent>
        </Card>

        {/* Widget 3: Ferramentas */}
        <Card className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="ghost" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/website?tab=brand">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span>Brand Kit</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/website?tab=push">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <span>Enviar Push</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
