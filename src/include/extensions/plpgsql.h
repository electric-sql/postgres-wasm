#include "postgres.h"

extern void plpgsql_PG_init(void);
extern Datum plpgsql_call_handler(PG_FUNCTION_ARGS);
extern Datum plpgsql_inline_handler(PG_FUNCTION_ARGS);
extern Datum plpgsql_validator(PG_FUNCTION_ARGS);

#ifndef PLPGSQL_INFO_DEF
extern Pg_finfo_record *pg_finfo_plpgsql_call_handler(void);
extern Pg_finfo_record *pg_finfo_plpgsql_inline_handler(void);
extern Pg_finfo_record *pg_finfo_plpgsql_validator(void);
#endif