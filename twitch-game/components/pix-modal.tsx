"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface PixModalProps {
  isOpen: boolean
  onClose: () => void
}

const PIX_KEY = "00020126360014BR.GOV.BCB.PIX0114+55839962494245204000053039865802BR5925Victor Morais Marcelino d6009SAO PAULO62140510nFXFKQs59C63040A1E"

export function PixModal({ isOpen, onClose }: PixModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-center">
            Pix Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex justify-center">
            <img
              src="/pix-qr.png"
              alt="Pix QR Code"
              className="w-full max-w-xs rounded-lg border-2 border-border"
            />
          </div>

          <Button
            onClick={handleCopy}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy Pix Key
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
