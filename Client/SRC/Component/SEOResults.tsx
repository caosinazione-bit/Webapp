import { SEOResults as SEOResultsType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, FileText, FileDown, Share, Plus, History, List, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";

interface SEOResultsProps {
  seoResults: SEOResultsType;
  onNewAnalysis: () => void;
}

export function SEOResults({ seoResults, onNewAnalysis }: SEOResultsProps) {
  const { toast } = useToast();
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemType]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemType);
          return newSet;
        });
      }, 2000);
      toast({
        title: "Copiato!",
        description: `${itemType} copiato negli appunti.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile copiare il testo.",
      });
    }
  };

  const exportToTxt = () => {
    const content = `
TITOLO SEO:
${seoResults.title}

DESCRIZIONE:
${seoResults.description}

TAG:
${seoResults.tags}

CONSIGLI MINIATURA:
${seoResults.thumbnailTips.map((tip, index) => `${index + 1}. ${tip}`).join('\n')}

CONSIGLI OTTIMIZZAZIONE:
${seoResults.optimizationTips.map((tip, index) => `${index + 1}. ${tip.title}: ${tip.description}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'timing pubblicazione': return 'border-blue-400';
      case 'engagement precoce': return 'border-green-400';
      case 'hook iniziale': return 'border-yellow-400';
      case 'call to action': return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Risultati SEO Ottimizzata</h2>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="w-3 h-3 inline mr-1" />
              Analisi Completata
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SEO Title */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">Titolo SEO Ottimizzato</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(seoResults.title, "Titolo")}
                className="text-youtube-red hover:text-youtube-dark"
              >
                {copiedItems.has("Titolo") ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-gray-800">{seoResults.title}</p>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>{seoResults.titleLength} caratteri</span>
              <span className={seoResults.titleLength >= 60 && seoResults.titleLength <= 100 ? "text-green-600" : "text-yellow-600"}>
                {seoResults.titleLength >= 60 && seoResults.titleLength <= 100 ? "Lunghezza ottimale" : "Lunghezza da ottimizzare"}
              </span>
            </div>
          </div>

          {/* SEO Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">Descrizione con Hashtag</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(seoResults.description, "Descrizione")}
                className="text-youtube-red hover:text-youtube-dark"
              >
                {copiedItems.has("Descrizione") ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{seoResults.description}</p>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>{seoResults.descriptionLength} caratteri</span>
              <span className="text-green-600">{seoResults.hashtags.length} hashtag inclusi</span>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">Tag (500 caratteri)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(seoResults.tags, "Tag")}
                className="text-youtube-red hover:text-youtube-dark"
              >
                {copiedItems.has("Tag") ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-white p-3 rounded border max-h-24 overflow-y-auto">
              <p className="text-gray-800 text-sm">{seoResults.tags}</p>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>{seoResults.tagsLength} caratteri</span>
              <span className={seoResults.tagsLength <= 500 ? "text-green-600" : "text-red-600"}>
                {seoResults.tags.split(',').length} tag ottimali
              </span>
            </div>
          </div>

          {/* Thumbnail Suggestions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">Consigli Miniatura</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(seoResults.thumbnailTips.join('\n'), "Consigli Miniatura")}
                className="text-youtube-red hover:text-youtube-dark"
              >
                {copiedItems.has("Consigli Miniatura") ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-3">
              {seoResults.thumbnailTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Optimization Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            Consigli Ottimizzazione Video
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seoResults.optimizationTips.map((tip, index) => (
              <div key={index} className={`bg-white p-3 rounded border-l-4 ${getCategoryColor(tip.category)}`}>
                <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Esporta Risultati</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={exportToTxt}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Esporta TXT</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 px-4 py-2 border-gray-300 hover:bg-gray-50"
            >
              <FileDown className="w-4 h-4" />
              <span>Esporta PDF</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 px-4 py-2 border-gray-300 hover:bg-gray-50"
            >
              <Share className="w-4 h-4" />
              <span>Condividi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={onNewAnalysis}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-youtube-red hover:bg-red-50 transition-colors text-left h-auto"
          >
            <Plus className="w-5 h-5 text-youtube-red flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Analizza Altro Video</h4>
              <p className="text-sm text-gray-600">Inserisci nuovo URL</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-auto"
          >
            <History className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Cronologia Analisi</h4>
              <p className="text-sm text-gray-600">Video analizzati</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left h-auto"
          >
            <List className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Analisi di Massa</h4>
              <p className="text-sm text-gray-600">Multipli URL</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
