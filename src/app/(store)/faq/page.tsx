"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/i18n";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Search, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category: string;
}

const FAQ_CATEGORIES = [
  { id: "orders", labelAr: "الطلبات والشحن", labelEn: "Orders & Shipping" },
  { id: "returns", labelAr: "الإرجاع والاستبدال", labelEn: "Returns & Exchange" },
  { id: "payment", labelAr: "الدفع", labelEn: "Payment" },
  { id: "account", labelAr: "الحساب", labelEn: "Account" },
];

const FAQ_DATA: FaqItem[] = [
  // Orders & Shipping
  {
    id: "1",
    category: "orders",
    questionAr: "كم يستغرق توصيل الطلب؟",
    questionEn: "How long does delivery take?",
    answerAr:
      "يتم توصيل الطلبات داخل القاهرة والجيزة خلال 2-3 أيام عمل، وباقي المحافظات خلال 3-5 أيام عمل.",
    answerEn:
      "Orders within Cairo and Giza are delivered in 2-3 business days, and other governorates in 3-5 business days.",
  },
  {
    id: "2",
    category: "orders",
    questionAr: "كيف أتتبع طلبي؟",
    questionEn: "How can I track my order?",
    answerAr:
      "يمكنك تتبع طلبك من خلال صفحة 'تتبع الطلب' باستخدام رقم الطلب أو من صفحة طلباتي في حسابك.",
    answerEn:
      "You can track your order through the 'Track Order' page using your order number, or from the 'My Orders' section in your account.",
  },
  {
    id: "3",
    category: "orders",
    questionAr: "هل يمكنني تغيير عنوان التوصيل بعد تأكيد الطلب؟",
    questionEn: "Can I change the delivery address after confirming an order?",
    answerAr:
      "يمكنك تغيير عنوان التوصيل فقط إذا كان الطلب لم يتم شحنه بعد. تواصلي معنا عبر واتساب أو الهاتف لتحديث العنوان.",
    answerEn:
      "You can change the delivery address only if the order hasn't been shipped yet. Contact us via WhatsApp or phone to update the address.",
  },
  {
    id: "4",
    category: "orders",
    questionAr: "هل يوجد حد أدنى للطلب؟",
    questionEn: "Is there a minimum order amount?",
    answerAr: "لا، لا يوجد حد أدنى للطلب. يمكنكِ طلب أي منتج بأي كمية.",
    answerEn:
      "No, there is no minimum order amount. You can order any product in any quantity.",
  },
  {
    id: "5",
    category: "orders",
    questionAr: "هل الشحن مجاني؟",
    questionEn: "Is shipping free?",
    answerAr:
      "نعم، الشحن مجاني للطلبات التي تزيد عن 1,000 جنيه. للطلبات الأقل، يتم حساب رسوم الشحن حسب المحافظة.",
    answerEn:
      "Yes, shipping is free for orders over EGP 1,000. For smaller orders, shipping fees are calculated based on the governorate.",
  },
  // Returns & Exchange
  {
    id: "6",
    category: "returns",
    questionAr: "ما هي سياسة الإرجاع؟",
    questionEn: "What is the return policy?",
    answerAr:
      "يمكنكِ إرجاع أو استبدال المنتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون بحالته الأصلية مع جميع البطاقات.",
    answerEn:
      "You can return or exchange a product within 14 days of delivery, provided it's in its original condition with all tags attached.",
  },
  {
    id: "7",
    category: "returns",
    questionAr: "كيف أطلب إرجاع أو استبدال؟",
    questionEn: "How do I request a return or exchange?",
    answerAr:
      "يمكنكِ طلب الإرجاع أو الاستبدال من صفحة تفاصيل الطلب في حسابك، أو تواصلي معنا عبر واتساب.",
    answerEn:
      "You can request a return or exchange from the order details page in your account, or contact us via WhatsApp.",
  },
  {
    id: "8",
    category: "returns",
    questionAr: "متى أسترد أموالي بعد الإرجاع؟",
    questionEn: "When will I get my refund after a return?",
    answerAr:
      "يتم استرداد المبلغ خلال 5-7 أيام عمل بعد استلامنا للمنتج المُرجَع وفحصه.",
    answerEn:
      "The refund is processed within 5-7 business days after we receive and inspect the returned product.",
  },
  // Payment
  {
    id: "9",
    category: "payment",
    questionAr: "ما هي طرق الدفع المتاحة؟",
    questionEn: "What payment methods are available?",
    answerAr:
      "نقبل الدفع عند الاستلام (كاش)، بطاقات الائتمان والخصم (فيزا/ماستركارد)، والمحافظ الإلكترونية.",
    answerEn:
      "We accept Cash on Delivery, credit/debit cards (Visa/Mastercard), and mobile wallets.",
  },
  {
    id: "10",
    category: "payment",
    questionAr: "هل الدفع عند الاستلام متاح لكل المحافظات؟",
    questionEn: "Is Cash on Delivery available for all governorates?",
    answerAr:
      "نعم، الدفع عند الاستلام متاح لجميع المحافظات.",
    answerEn:
      "Yes, Cash on Delivery is available for all governorates.",
  },
  {
    id: "11",
    category: "payment",
    questionAr: "هل بياناتي المالية آمنة؟",
    questionEn: "Is my financial information secure?",
    answerAr:
      "نعم، جميع المعاملات مشفرة ومؤمنة بأعلى معايير الأمان. لا نحتفظ ببيانات بطاقتك.",
    answerEn:
      "Yes, all transactions are encrypted and secured with the highest security standards. We do not store your card details.",
  },
  // Account
  {
    id: "12",
    category: "account",
    questionAr: "كيف أنشئ حساب؟",
    questionEn: "How do I create an account?",
    answerAr:
      "اضغطي على 'تسجيل' في أعلى الصفحة وأدخلي بياناتك. يمكنكِ أيضاً الطلب كزائرة بدون حساب.",
    answerEn:
      "Click 'Register' at the top of the page and enter your details. You can also order as a guest without creating an account.",
  },
  {
    id: "13",
    category: "account",
    questionAr: "نسيت كلمة المرور، ماذا أفعل؟",
    questionEn: "I forgot my password, what should I do?",
    answerAr:
      "اضغطي على 'نسيت كلمة المرور' في صفحة تسجيل الدخول وأدخلي بريدك الإلكتروني لاستعادتها.",
    answerEn:
      "Click 'Forgot Password' on the login page and enter your email to recover it.",
  },
  {
    id: "14",
    category: "account",
    questionAr: "كيف أحدث بياناتي الشخصية؟",
    questionEn: "How do I update my personal information?",
    answerAr:
      "يمكنكِ تحديث بياناتك من صفحة 'الإعدادات' في حسابك.",
    answerEn:
      "You can update your information from the 'Settings' page in your account.",
  },
];

export default function FaqPage() {
  const { locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const texts = {
    pageTitle: locale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions",
    pageSubtitle:
      locale === "ar"
        ? "إجابات على أكثر الأسئلة شيوعاً"
        : "Answers to the most commonly asked questions",
    searchPlaceholder:
      locale === "ar" ? "ابحثي في الأسئلة..." : "Search questions...",
    allCategories: locale === "ar" ? "الكل" : "All",
    noResults:
      locale === "ar"
        ? "لم يتم العثور على نتائج"
        : "No results found",
    noResultsDesc:
      locale === "ar"
        ? "جربي كلمات بحث مختلفة أو تصفحي الأقسام"
        : "Try different search terms or browse the categories",
    contactCta:
      locale === "ar"
        ? "لم تجدي إجابة على سؤالك؟"
        : "Didn't find an answer to your question?",
    contactBtn: locale === "ar" ? "تواصلي معنا" : "Contact Us",
  };

  const filteredFaqs = useMemo(() => {
    let faqs = FAQ_DATA;

    if (activeCategory) {
      faqs = faqs.filter((faq) => faq.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter((faq) => {
        const question =
          locale === "ar" ? faq.questionAr : faq.questionEn;
        const answer = locale === "ar" ? faq.answerAr : faq.answerEn;
        return (
          question.toLowerCase().includes(query) ||
          answer.toLowerCase().includes(query)
        );
      });
    }

    return faqs;
  }, [activeCategory, searchQuery, locale]);

  // Group filtered FAQs by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<string, FaqItem[]> = {};
    filteredFaqs.forEach((faq) => {
      if (!groups[faq.category]) groups[faq.category] = [];
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen bg-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-rose-gold/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-rose-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">
            {texts.pageTitle}
          </h1>
          <p className="text-charcoal/60">{texts.pageSubtitle}</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg mx-auto">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={texts.searchPlaceholder}
            className="w-full h-11 ps-10 pe-4 border border-beige rounded-xl bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              !activeCategory
                ? "bg-rose-gold text-white"
                : "bg-white text-charcoal/60 border border-beige hover:border-rose-gold hover:text-rose-gold"
            }`}
          >
            {texts.allCategories}
          </button>
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-rose-gold text-white"
                  : "bg-white text-charcoal/60 border border-beige hover:border-rose-gold hover:text-rose-gold"
              }`}
            >
              {locale === "ar" ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* FAQ Content */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-charcoal/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {texts.noResults}
            </h3>
            <p className="text-sm text-charcoal/60">{texts.noResultsDesc}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFaqs).map(([categoryId, faqs]) => {
              const category = FAQ_CATEGORIES.find((c) => c.id === categoryId);
              return (
                <div
                  key={categoryId}
                  className="bg-white rounded-2xl border border-beige/50 shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-beige/50 bg-beige/20">
                    <h2 className="font-semibold text-charcoal">
                      {locale === "ar"
                        ? category?.labelAr
                        : category?.labelEn}
                    </h2>
                  </div>
                  <div className="px-6">
                    <Accordion type="single" collapsible>
                      {faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-start">
                            {locale === "ar"
                              ? faq.questionAr
                              : faq.questionEn}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-charcoal/70 leading-relaxed">
                              {locale === "ar"
                                ? faq.answerAr
                                : faq.answerEn}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact CTA */}
        <div className="text-center mt-12 bg-white rounded-2xl border border-beige/50 shadow-sm p-8">
          <p className="text-charcoal/70 mb-4">{texts.contactCta}</p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-rose-gold text-white text-sm font-medium hover:bg-rose-gold/90 transition-colors"
          >
            {texts.contactBtn}
          </a>
        </div>
      </div>
    </div>
  );
}
