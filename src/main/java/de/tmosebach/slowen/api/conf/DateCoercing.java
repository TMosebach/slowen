package de.tmosebach.slowen.api.conf;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;

import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

public class DateCoercing implements Coercing<LocalDate, String>{
	
	private static final String INVALID_INPUT = "ungültige Eingabe:";

	 @Override
     public String serialize(Object dataFetcherResult, GraphQLContext graphQLContext, Locale locale) throws CoercingSerializeException {
         try {
             Instant publishedTime = (Instant) dataFetcherResult;
             
             return publishedTime.toString();
         } catch (CoercingSerializeException exception) {
             throw new CoercingSerializeException(INVALID_INPUT+exception.getMessage());
         }
     }
	 
	 @Override
     public LocalDate parseValue(Object input, GraphQLContext graphQLContext, Locale locale) throws CoercingParseValueException {
         try{
             return LocalDate.parse((String) input);
         } catch (RuntimeException exception) {
             throw new CoercingParseValueException(INVALID_INPUT+exception.getMessage());
         }
     }

     @Override
     public LocalDate parseLiteral(Value<?> input, CoercedVariables variables, GraphQLContext graphQLContext, Locale locale) throws CoercingParseLiteralException {
         try {
             StringValue stringValue = (StringValue) input;
             return LocalDate.parse(stringValue.getValue());
         } catch (RuntimeException exception) {
             throw new CoercingParseLiteralException(INVALID_INPUT+exception.getMessage());
         }
     }

     @Override
     public Value<?> valueToLiteral(Object input, GraphQLContext graphQLContext, Locale locale) {
         return new StringValue(input.toString());
     }
}
