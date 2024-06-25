#define PGlite_FUNCTION_INFO_V1(sym)           \
    extern Datum sym(FunctionCallInfo fcinfo); \
    extern const Pg_finfo_record *pg_finfo_##sym(void)