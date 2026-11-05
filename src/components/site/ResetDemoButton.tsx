import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export function ResetDemoButton({ className }: { className?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm underline-offset-4 hover:underline",
            className,
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Restablecer demostración
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer la demostración?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán los casos creados en este navegador y se volverá a los cuatro casos de
            ejemplo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetDemo();
              toast.success("La demostración volvió a su estado inicial.");
            }}
          >
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
